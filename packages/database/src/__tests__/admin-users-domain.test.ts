import { describe, it, expect, vi } from 'vitest';
import { UserService, UserRepository } from '../index';
import { AppError } from '@elsesourav/types';
import type {
  User,
  AdminUserListItem,
  AdminUserDetail,
} from '@elsesourav/types';

describe('Admin User Management & Role Authorization Security', () => {
  const mockUser: User = {
    id: 'user-target-1',
    supabaseAuthId: 'supa-target-1',
    email: 'developer@example.com',
    displayName: 'Alex Developer',
    username: 'alexdev',
    role: 'USER',
    status: 'active',
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      reduceMotion: false,
      compactView: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockAdminUser: User = {
    ...mockUser,
    id: 'admin-1',
    supabaseAuthId: 'supa-admin-1',
    email: 'admin@elsesourav.com',
    displayName: 'Super Admin',
    role: 'ADMIN',
  };

  const mockUserListItem: AdminUserListItem = {
    id: 'user-target-1',
    email: 'developer@example.com',
    displayName: 'Alex Developer',
    username: 'alexdev',
    role: 'USER',
    status: 'active',
    libraryCount: 3,
    supportTicketCount: 2,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockUserDetail: AdminUserDetail = {
    ...mockUser,
    libraryCount: 3,
    supportTicketCount: 2,
    openTicketCount: 1,
  };

  // ==========================================
  // List Users Admin
  // ==========================================
  describe('listUsersAdmin', () => {
    it('allows ADMIN to retrieve paginated user directory with counts', async () => {
      const mockRepo = {
        findAllUsersAdmin: vi.fn().mockResolvedValue({
          users: [mockUserListItem],
          total: 1,
        }),
      } as unknown as UserRepository;

      const service = new UserService(mockRepo);

      const result = await service.listUsersAdmin('ADMIN', { page: 1, limit: 20 });
      expect(result.users.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.users[0]?.displayName).toBe('Alex Developer');
      expect(result.users[0]?.libraryCount).toBe(3);
    });

    it('strictly forbids normal USER from listing admin users directory', async () => {
      const mockRepo = {
        findAllUsersAdmin: vi.fn(),
      } as unknown as UserRepository;

      const service = new UserService(mockRepo);

      await expect(service.listUsersAdmin('USER')).rejects.toThrowError(AppError);
      expect(mockRepo.findAllUsersAdmin).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // User Detail Admin
  // ==========================================
  describe('getUserDetailAdmin', () => {
    it('allows ADMIN to retrieve full user administrative summary', async () => {
      const mockRepo = {
        findUserDetailAdmin: vi.fn().mockResolvedValue(mockUserDetail),
      } as unknown as UserRepository;

      const service = new UserService(mockRepo);

      const detail = await service.getUserDetailAdmin('ADMIN', 'user-target-1');
      expect(detail.id).toBe('user-target-1');
      expect(detail.openTicketCount).toBe(1);
      expect(detail.libraryCount).toBe(3);
    });

    it('strictly blocks normal USER from viewing administrative user details', async () => {
      const mockRepo = {
        findUserDetailAdmin: vi.fn(),
      } as unknown as UserRepository;

      const service = new UserService(mockRepo);

      await expect(
        service.getUserDetailAdmin('USER', 'user-target-1')
      ).rejects.toThrowError(AppError);
    });
  });

  // ==========================================
  // Role Mutations & Self-Protection
  // ==========================================
  describe('updateUserRoleAdmin', () => {
    it('allows ADMIN to promote a user to STAFF or ADMIN', async () => {
      const mockRepo = {
        findById: vi.fn().mockResolvedValue(mockUser),
        updateRole: vi.fn().mockResolvedValue({ ...mockUser, role: 'STAFF' }),
      } as unknown as UserRepository;

      const service = new UserService(mockRepo);

      const updated = await service.updateUserRoleAdmin(
        'admin-1',
        'ADMIN',
        'user-target-1',
        'STAFF'
      );

      expect(updated.role).toBe('STAFF');
      expect(mockRepo.updateRole).toHaveBeenCalledWith(
        'user-target-1',
        'STAFF',
        'admin-1'
      );
    });

    it('strictly forbids STAFF and normal USER from modifying user roles', async () => {
      const mockRepo = {
        findById: vi.fn(),
        updateRole: vi.fn(),
      } as unknown as UserRepository;

      const service = new UserService(mockRepo);

      await expect(
        service.updateUserRoleAdmin('staff-1', 'STAFF', 'user-target-1', 'ADMIN')
      ).rejects.toThrowError(AppError);

      await expect(
        service.updateUserRoleAdmin('user-1', 'USER', 'user-target-1', 'ADMIN')
      ).rejects.toThrowError(AppError);
    });

    it('prevents demoting the sole system administrator (Self-Lockout Protection)', async () => {
      const mockRepo = {
        findById: vi.fn().mockResolvedValue(mockAdminUser),
        countAdmins: vi.fn().mockResolvedValue(1), // Only 1 admin in system
        updateRole: vi.fn(),
      } as unknown as UserRepository;

      const service = new UserService(mockRepo);

      await expect(
        service.updateUserRoleAdmin('admin-1', 'ADMIN', 'admin-1', 'USER')
      ).rejects.toThrowError(AppError);

      expect(mockRepo.updateRole).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // Admin Account Deletion
  // ==========================================
  describe('deleteUserAccountAdmin', () => {
    it('allows ADMIN to delete a user account with audit logging', async () => {
      const mockRepo = {
        findById: vi.fn().mockResolvedValue(mockUser),
        adminDeleteUser: vi.fn().mockResolvedValue(undefined),
      } as unknown as UserRepository;

      const service = new UserService(mockRepo);

      await expect(
        service.deleteUserAccountAdmin('admin-1', 'ADMIN', 'user-target-1', 'Violation of ToS')
      ).resolves.not.toThrow();

      expect(mockRepo.adminDeleteUser).toHaveBeenCalledWith(
        'user-target-1',
        'admin-1',
        'Violation of ToS'
      );
    });

    it('prevents ADMIN from deleting their own account via Admin management', async () => {
      const mockRepo = {
        findById: vi.fn(),
        adminDeleteUser: vi.fn(),
      } as unknown as UserRepository;

      const service = new UserService(mockRepo);

      await expect(
        service.deleteUserAccountAdmin('admin-1', 'ADMIN', 'admin-1')
      ).rejects.toThrowError(AppError);

      expect(mockRepo.adminDeleteUser).not.toHaveBeenCalled();
    });

    it('strictly forbids normal USER from triggering admin deletion', async () => {
      const mockRepo = {
        findById: vi.fn(),
        adminDeleteUser: vi.fn(),
      } as unknown as UserRepository;

      const service = new UserService(mockRepo);

      await expect(
        service.deleteUserAccountAdmin('user-1', 'USER', 'user-target-1')
      ).rejects.toThrowError(AppError);
    });
  });
});
