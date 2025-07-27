import { useUserActions } from '../hooks/use-user-actions';
import { Button } from '@/shared/components/atoms/ui/button';
import { Ban, RefreshCcw, Shield, Trash2 } from 'lucide-react';

import type { User } from '@/features/user/user.schema';

interface UserAdminToolbarActionsProps {
  selectedRows: User[];
}

export function UserAdminToolbarActions({ selectedRows }: UserAdminToolbarActionsProps) {
  const { ban, unban, revokeSessions, deleteUser } = useUserActions();
  return (
    <div className="flex gap-2">
      <Button
        variant="destructive"
        size="sm"
        disabled={selectedRows.length === 0}
        onClick={() => {
          selectedRows.forEach((user) => ban.mutate({ id: user.id, reason: 'Violation', banExpiresIn: 7 * 24 * 60 * 60 }));
        }}
      >
        <Ban className="w-4 h-4 mr-1" /> Bannir
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={selectedRows.length === 0}
        onClick={() => {
          selectedRows.forEach((user) => unban.mutate(user.id));
        }}
      >
        <RefreshCcw className="w-4 h-4 mr-1" /> Débannir
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={selectedRows.length === 0}
        onClick={() => {
          selectedRows.forEach((user) => revokeSessions.mutate(user.id));
        }}
      >
        <Shield className="w-4 h-4 mr-1" /> Révoquer sessions
      </Button>
      <Button
        variant="destructive"
        size="sm"
        disabled={selectedRows.length === 0}
        onClick={() => {
          selectedRows.forEach((user) => deleteUser.mutate(user.id));
        }}
      >
        <Trash2 className="w-4 h-4 mr-1" /> Supprimer
      </Button>
    </div>
  );
}
