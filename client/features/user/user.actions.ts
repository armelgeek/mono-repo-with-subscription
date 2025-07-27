import { authClient } from '@/shared/lib/config/auth-client';

export async function banUser(id: string, reason: string, banExpiresIn?: number) {
  const res = await authClient.admin.banUser({ userId: id, banReason: reason, banExpiresIn });
  if (res?.error) throw new Error(res.error.message || 'Failed to ban user');
  return res;
}

export async function unbanUser(id: string) {
  const res = await authClient.admin.unbanUser({ userId: id });
  if (res?.error) throw new Error(res.error.message || 'Failed to unban user');
  return res;
}

export async function updateUserRole(id: string, role: 'user' | 'admin') {
  const res = await authClient.admin.setRole({ userId: id, role });
  if (res?.error) throw new Error(res.error.message || 'Failed to update user role');
  return res;
}

export async function revokeUserSessions(id: string) {
  const res = await authClient.admin.revokeUserSessions({ userId: id });
  if (res?.error) throw new Error(res.error.message || 'Failed to revoke user sessions');
  return res;
}

export async function deleteUser(id: string) {
  const res = await authClient.admin.removeUser({ userId: id });
  if (res?.error) throw new Error(res.error.message || 'Failed to delete user');
  return res;
}

export async function createUser(data: { name: string; email: string; password: string; role?: 'user' | 'admin'; autoVerify?: boolean }) {
  const { autoVerify, ...userData } = data;
  const createData = {
    ...userData,
    data: {
      ...(autoVerify ? { emailVerified: true } : {}),
    },
  };
  const res = await authClient.admin.createUser(createData);
  if (res?.error) throw new Error(res.error.message || 'Failed to create user');
  if (!autoVerify) {
    try {
      await authClient.sendVerificationEmail({ email: data.email, callbackURL: '/dashboard' });
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
  }
  return res;
}
