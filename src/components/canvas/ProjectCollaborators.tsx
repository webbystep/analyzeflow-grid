import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface Collaborator {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'guest';
  type: 'member' | 'guest';
}

interface ProjectCollaboratorsProps {
  workspaceId: string;
  projectId: string;
}

const avatarColors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500',
];

const getAvatarColor = (email: string) => {
  const hash = email.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const getInitials = (name: string | null, email: string) => {
  if (name && name.trim()) {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
};

const getRoleLabel = (role: string, type: string) => {
  if (type === 'guest') return 'Külsős (megtekintés)';
  const roleMap: Record<string, string> = {
    owner: 'Tulajdonos',
    admin: 'Admin',
    editor: 'Szerkesztő',
    viewer: 'Megtekintő',
  };
  return roleMap[role] || role;
};

export const ProjectCollaborators = ({ workspaceId, projectId }: ProjectCollaboratorsProps) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const maxVisible = 5;

  useEffect(() => {
    const loadCollaborators = async () => {
      // Load workspace members
      const { data: members } = await supabase
        .from('workspace_members')
        .select('user_id, role, profiles(id, name, email, avatar_url)')
        .eq('workspace_id', workspaceId);

      // Load guest users for this project
      const { data: guests } = await supabase
        .from('guest_access')
        .select('id, email, created_at')
        .eq('project_id', projectId);

      const allCollaborators: Collaborator[] = [];

      if (members) {
        members.forEach((member: any) => {
          if (member.profiles) {
            allCollaborators.push({
              id: member.profiles.id,
              name: member.profiles.name,
              email: member.profiles.email,
              avatar_url: member.profiles.avatar_url,
              role: member.role,
              type: 'member',
            });
          }
        });
      }

      if (guests) {
        guests.forEach((guest: any) => {
          allCollaborators.push({
            id: guest.id,
            name: null,
            email: guest.email,
            avatar_url: null,
            role: 'guest',
            type: 'guest',
          });
        });
      }

      setCollaborators(allCollaborators);
    };

    loadCollaborators();
  }, [workspaceId, projectId]);

  const visibleCollaborators = collaborators.slice(0, maxVisible);
  const remainingCount = collaborators.length - maxVisible;

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {visibleCollaborators.map((collaborator) => (
          <Tooltip key={collaborator.id}>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:z-10 transition-transform hover:scale-110">
                <AvatarImage src={collaborator.avatar_url || undefined} alt={collaborator.name || collaborator.email} />
                <AvatarFallback className={getAvatarColor(collaborator.email)}>
                  <span className="text-xs font-semibold text-white">
                    {getInitials(collaborator.name, collaborator.email)}
                  </span>
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div className="font-semibold">{collaborator.name || collaborator.email}</div>
                <div className="text-muted-foreground">{getRoleLabel(collaborator.role, collaborator.type)}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              >
                +{remainingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">További {remainingCount} tag</div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
