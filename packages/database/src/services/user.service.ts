import { UserRepository } from '../repositories/user.repository';
import { AppError } from '@elsesourav/types';
import { RESERVED_USERNAMES } from '@elsesourav/validation';
import type {
  User,
  PublicUserProfile,
  UpdateProfileInput,
  UpdatePreferencesInput,
  SyncUserAuthInput,
} from '@elsesourav/types';

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async syncUser(authInput: SyncUserAuthInput): Promise<User> {
    return this.userRepo.syncUserAuth(authInput);
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
      throw AppError.validation('Invalid confirmation phrase. Please type "DELETE MY ACCOUNT" exactly');
    }

    return this.userRepo.softDeleteUserTransaction(targetUserId, reason);
  }
}
