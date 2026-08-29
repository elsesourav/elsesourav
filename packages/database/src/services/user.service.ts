import { UserRepository } from '../repositories/user.repository';
import { AppError } from '@elsesourav/types';
import { RESERVED_USERNAMES } from '@elsesourav/validation';
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
      if (RESERVED_USERNAMES.includes(normalized as (typeof RESERVED_USERNAMES)[number])) {
        throw AppError.validation(`Username '${data.username}' is reserved and cannot be claimed`);
      }
    }

    return this.userRepo.updateProfile(targetUserId, data);
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
