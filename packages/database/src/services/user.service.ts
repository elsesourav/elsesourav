import { UserRepository } from '../repositories/user.repository';
import { AppError } from '@elsesourav/types';
import { RESERVED_USERNAMES, UsernameSchema } from '@elsesourav/validation';
import type {
  User,
  PublicUserProfile,
  UpdateProfileInput,
  UpdatePreferencesInput,
  SyncUserAuthInput,
  UserRole,
  AdminUserListItem,
  AdminUserDetail,
} from '@elsesourav/types';

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  private verifyAdmin(callerRole?: UserRole | string): void {
    if (callerRole !== 'ADMIN' && callerRole !== 'STAFF') {
      throw AppError.forbidden('Administrative privileges are required for this action.');
    }
  }

  private verifySuperAdmin(callerRole?: UserRole | string): void {
    if (callerRole !== 'ADMIN') {
      throw AppError.forbidden('Administrator privileges are required for this role mutation.');
    }
  }

  async syncUser(authInput: SyncUserAuthInput): Promise<User> {
    return this.userRepo.syncUserAuth(authInput);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async getPublicProfile(username: string): Promise<PublicUserProfile> {
    const profile = await this.userRepo.getPublicProfile(username);
    if (!profile) {
      throw AppError.notFound(`User profile '@${username}'`);
    }
    return profile;
  }

  async updateProfile(
    requestingUserId: string,
    targetUserId: string,
    data: UpdateProfileInput
  ): Promise<User> {
    // Strict server-side ownership enforcement
    if (requestingUserId !== targetUserId) {
      throw AppError.forbidden('You do not have permission to modify this user profile');
    }

    if (data.username) {
      const normalized = data.username.trim().toLowerCase();
      if (normalized.length < 4) {
        throw AppError.validation('Username must be at least 4 characters long');
      }
      if (RESERVED_USERNAMES.includes(normalized as (typeof RESERVED_USERNAMES)[number])) {
        throw AppError.validation(`Username '${data.username}' is reserved and cannot be claimed`);
      }
      const existing = await this.userRepo.findByUsername(normalized);
      if (existing && existing.id !== targetUserId) {
        throw AppError.validation(`Username '${data.username}' is already taken`);
      }
    }

    return this.userRepo.updateProfile(targetUserId, data);
  }

  async checkUsernameAvailability(
    username: string,
    currentUserId?: string
  ): Promise<{ available: boolean; error?: string }> {
    const parsed = UsernameSchema.safeParse(username.trim().toLowerCase());
    if (!parsed.success) {
      return {
        available: false,
        error: parsed.error.issues[0]?.message || 'Invalid username format',
      };
    }

    const normalized = parsed.data;
    const existing = await this.userRepo.findByUsername(normalized);
    if (existing && existing.id !== currentUserId) {
      return { available: false, error: 'Username is already taken' };
    }

    return { available: true };
  }

  /**
   * Generates and verifies available username suggestions based on a name or handle
   */
  async suggestAvailableUsernames(baseName: string, count = 2): Promise<string[]> {
    const clean = baseName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, '')
      .replace(/\s+/g, '_');

    if (!clean) return [];

    const parts = clean.split('_').filter(Boolean);
    const first = parts[0] || 'user';
    const last = parts.slice(1).join('_');

    // Candidate generator patterns
    const rawCandidates: string[] = [];

    if (first && last) {
      rawCandidates.push(`${first}_${last}`);
      rawCandidates.push(`${first}${last}`);
      rawCandidates.push(`${first}_${last.slice(0, 2)}`);
      rawCandidates.push(`${first.slice(0, 1)}_${last}`);
      rawCandidates.push(`${first}_${last}_dev`);
    } else {
      rawCandidates.push(`${first}_dev`);
      rawCandidates.push(`${first}_code`);
      rawCandidates.push(`${first}_app`);
      rawCandidates.push(`${first}_pro`);
    }

    // Numerical and timestamp suffix variations
    const randomSuffix1 = Math.floor(10 + Math.random() * 89);
    const randomSuffix2 = Math.floor(100 + Math.random() * 899);
    rawCandidates.push(`${first}_${randomSuffix1}`);
    rawCandidates.push(`${first}${randomSuffix2}`);

    // Deduplicate and filter candidates by constraints
    const validCandidates = Array.from(new Set(rawCandidates)).filter((c) => {
      return (
        c.length >= 4 &&
        c.length <= 30 &&
        /^[a-z0-9_-]+$/.test(c) &&
        !RESERVED_USERNAMES.includes(c as (typeof RESERVED_USERNAMES)[number])
      );
    });

    const availableSuggestions: string[] = [];

    for (const candidate of validCandidates) {
      if (availableSuggestions.length >= count) break;
      const existing = await this.userRepo.findByUsername(candidate);
      if (!existing) {
        availableSuggestions.push(candidate);
      }
    }

    return availableSuggestions;
  }

  async updatePreferences(
    requestingUserId: string,
    targetUserId: string,
    preferences: UpdatePreferencesInput
  ): Promise<User> {
    if (requestingUserId !== targetUserId) {
      throw AppError.forbidden('You do not have permission to modify these preferences');
    }

    return this.userRepo.updatePreferences(targetUserId, preferences);
  }

  async requestAccountDeletion(
    requestingUserId: string,
    targetUserId: string,
    confirmation: string,
    reason?: string
  ): Promise<void> {
    if (requestingUserId !== targetUserId) {
      throw AppError.forbidden('You do not have permission to delete this account');
    }

    if (confirmation !== 'DELETE MY ACCOUNT') {
      throw AppError.validation(
        'Invalid confirmation phrase. Please type "DELETE MY ACCOUNT" exactly'
      );
    }

    return this.userRepo.softDeleteUserTransaction(targetUserId, reason);
  }

  // ==========================================
  // Admin Operations
  // ==========================================

  /**
   * Lists users for Admin management with pagination and safe search
   */
  async listUsersAdmin(
    callerRole: UserRole,
    options: {
      role?: UserRole | 'all';
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ users: AdminUserListItem[]; total: number; totalPages: number }> {
    this.verifyAdmin(callerRole);

    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
    const { users, total } = await this.userRepo.findAllUsersAdmin({
      ...options,
      limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users,
      total,
      totalPages,
    };
  }

  /**
   * Retrieves full user administration detail including support & library statistics
   */
  async getUserDetailAdmin(callerRole: UserRole, userId: string): Promise<AdminUserDetail> {
    this.verifyAdmin(callerRole);

    const detail = await this.userRepo.findUserDetailAdmin(userId);
    if (!detail) {
      throw AppError.notFound('User not found');
    }

    return detail;
  }

  /**
   * Safely updates a user's role with self-lockout protection and audit trail
   */
  async updateUserRoleAdmin(
    callerUserId: string,
    callerRole: UserRole,
    targetUserId: string,
    newRole: UserRole
  ): Promise<User> {
    this.verifySuperAdmin(callerRole);

    const targetUser = await this.userRepo.findById(targetUserId);
    if (!targetUser) {
      throw AppError.notFound('Target user not found');
    }

    // Prevent demoting the last admin in the system
    if (targetUser.role === 'ADMIN' && newRole !== 'ADMIN') {
      const adminCount = await this.userRepo.countAdmins();
      if (adminCount <= 1) {
        throw AppError.validation(
          'Cannot demote the sole system administrator. Add another admin first.'
        );
      }
    }

    return this.userRepo.updateRole(targetUserId, newRole, callerUserId);
  }

  /**
   * Administrative user account deletion with audit logging
   */
  async deleteUserAccountAdmin(
    callerUserId: string,
    callerRole: UserRole,
    targetUserId: string,
    reason?: string
  ): Promise<void> {
    this.verifySuperAdmin(callerRole);

    if (callerUserId === targetUserId) {
      throw AppError.validation(
        'Administrators cannot delete their own account via the Admin workspace.'
      );
    }

    const targetUser = await this.userRepo.findById(targetUserId);
    if (!targetUser) {
      throw AppError.notFound('Target user not found');
    }

    if (targetUser.role === 'ADMIN') {
      const adminCount = await this.userRepo.countAdmins();
      if (adminCount <= 1) {
        throw AppError.validation('Cannot delete the sole system administrator.');
      }
    }

    return this.userRepo.adminDeleteUser(targetUserId, callerUserId, reason);
  }
}
