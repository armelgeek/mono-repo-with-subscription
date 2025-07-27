import { useMutation } from '@tanstack/react-query';

import { banUser, unbanUser, updateUserRole, revokeUserSessions, deleteUser as deleteUserAction, createUser as createUserAction } from '../user.actions';

export function useUserActions() {

  const ban = useMutation({
    mutationFn: ({ id, reason, banExpiresIn }: { id: string; reason: string; banExpiresIn?: number }) =>
      banUser(id, reason, banExpiresIn),
  });

  const unban = useMutation({
    mutationFn: (id: string) => unbanUser(id),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) =>
      updateUserRole(id, role),
  });

  const revokeSessions = useMutation({
    mutationFn: (id: string) => revokeUserSessions(id),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => deleteUserAction(id),
  });

  const createUser = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role?: 'user' | 'admin'; autoVerify?: boolean }) =>
      createUserAction(data),
  });

  return {
    ban,
    unban,
    updateRole,
    revokeSessions,
    deleteUser,
    createUser,
  };
}
