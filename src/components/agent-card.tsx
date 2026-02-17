'use client';

import { Agent } from '@/types/agent';
import { AgentIcon } from './icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Power,
  Eye,
  Play,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onToggle: (agent: Agent) => void;
}

export function AgentCard({ agent, onEdit, onDelete, onToggle }: AgentCardProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        'group relative flex flex-col p-5 rounded-2xl border bg-card transition-all duration-200 hover:shadow-lg hover:border-foreground/20 cursor-pointer'
      )}
      onClick={() => router.push(`/agents/${agent.id}`)}
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {agent.enabled && (
          <div className="w-2 h-2 rounded-full bg-green-500" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => router.push(`/agents/${agent.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(agent)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggle(agent)}>
              <Power className="h-4 w-4 mr-2" />
              {agent.enabled ? 'Disable' : 'Enable'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(agent.url, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open URL
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(agent)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Icon */}
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
          agent.enabled
            ? 'bg-foreground text-background'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <AgentIcon icon={agent.icon} size="lg" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold truncate">{agent.name}</h3>
          {agent.version && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              v{agent.version}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {agent.description}
        </p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5">
          {agent.trigger_keywords?.slice(0, 3).map((keyword, i) => (
            <Badge key={i} variant="secondary" className="text-xs font-normal">
              {keyword}
            </Badge>
          ))}
          {agent.trigger_keywords && agent.trigger_keywords.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{agent.trigger_keywords.length - 3}
            </Badge>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          {agent.is_public ? (
            <Badge variant="outline" className="text-xs">Public</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Private</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/agents/${agent.id}`);
          }}
        >
          <Play className="h-3 w-3 mr-1" />
          Test
        </Button>
      </div>
    </div>
  );
}
