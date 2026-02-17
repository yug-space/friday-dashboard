export interface Agent {
  id: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  icon: string;
  use_cases: string[];
  trigger_keywords: string[];
  tools: AgentTool[];
  enabled: boolean;
  is_public: boolean;
  version?: string;
  author?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
}

export interface CreateAgentInput {
  name: string;
  slug: string;
  url: string;
  description: string;
  icon: string;
  use_cases: string[];
  trigger_keywords: string[];
  tools: AgentTool[];
  enabled: boolean;
  is_public: boolean;
  version?: string;
  author?: string;
}

export const AVAILABLE_ICONS = [
  'bot',
  'code',
  'calendar',
  'mail',
  'github',
  'database',
  'globe',
  'file',
  'search',
  'messagesquare',
  'listchecks',
  'image',
  'music',
  'video',
  'podcast',
  'checksquare',
] as const;
