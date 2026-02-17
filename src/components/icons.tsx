'use client';

import {
  Bot,
  Code,
  Calendar,
  Mail,
  Github,
  Database,
  Globe,
  FileText,
  Search,
  MessageSquare,
  ListChecks,
  Image,
  Music,
  Video,
  Podcast,
  CheckSquare,
  Box,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  bot: Bot,
  code: Code,
  calendar: Calendar,
  mail: Mail,
  github: Github,
  database: Database,
  globe: Globe,
  file: FileText,
  search: Search,
  messagesquare: MessageSquare,
  listchecks: ListChecks,
  image: Image,
  music: Music,
  video: Video,
  podcast: Podcast,
  checksquare: CheckSquare,
  default: Box,
};

interface AgentIconProps {
  icon: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AgentIcon({ icon, className, size = 'md' }: AgentIconProps) {
  const normalizedName = icon?.toLowerCase().replace(/[^a-z]/g, '') || 'default';
  const IconComponent = iconMap[normalizedName] || iconMap.default;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return <IconComponent className={cn(sizeClasses[size], className)} />;
}

export function IconSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const icons = Object.keys(iconMap).filter((k) => k !== 'default');

  return (
    <div className="grid grid-cols-8 gap-2">
      {icons.map((iconName) => {
        const Icon = iconMap[iconName];
        return (
          <button
            key={iconName}
            type="button"
            onClick={() => onChange(iconName)}
            className={cn(
              'p-3 rounded-lg border transition-all duration-200',
              value === iconName
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background hover:bg-muted border-border hover:border-foreground/30'
            )}
          >
            <Icon className="h-5 w-5 mx-auto" />
          </button>
        );
      })}
    </div>
  );
}
