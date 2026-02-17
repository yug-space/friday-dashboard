import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const sampleAgents = [
  {
    name: 'Code Suggester',
    slug: 'code-suggester',
    url: 'https://friday-code-suggester.vercel.app/api/suggest',
    description: 'Suggests code improvements and fixes based on your current coding context',
    icon: 'code',
    use_cases: ['Code suggestions', 'Bug fixes', 'Refactoring help', 'Code completion'],
    trigger_keywords: ['code', 'function', 'class', 'error', 'bug', 'fix', 'refactor'],
    tools: [],
    enabled: true,
    is_public: true,
    version: '1.0.0',
    author: 'Friday Team',
  },
  {
    name: 'Linear Agent',
    slug: 'linear-agent',
    url: 'https://friday-linear-agent.vercel.app/api/linear',
    description: 'Manages Linear issues - creates, updates, and tracks your project tasks',
    icon: 'listchecks',
    use_cases: ['Create issues', 'Update status', 'Track progress', 'Manage sprints'],
    trigger_keywords: ['linear', 'issue', 'ticket', 'task', 'sprint', 'backlog'],
    tools: [],
    enabled: true,
    is_public: true,
    version: '1.0.0',
    author: 'Friday Team',
  },
  {
    name: 'Calendar Agent',
    slug: 'calendar-agent',
    url: 'https://friday-calendar-agent.vercel.app/api/calendar',
    description: 'Helps schedule meetings and manage your calendar events',
    icon: 'calendar',
    use_cases: ['Schedule meetings', 'Check availability', 'Create events', 'Set reminders'],
    trigger_keywords: ['meeting', 'calendar', 'schedule', 'event', 'appointment', 'remind'],
    tools: [],
    enabled: true,
    is_public: true,
    version: '1.0.0',
    author: 'Friday Team',
  },
  {
    name: 'GitHub Agent',
    slug: 'github-agent',
    url: 'https://friday-github-agent.vercel.app/api/github',
    description: 'Interacts with GitHub - creates PRs, reviews code, manages issues',
    icon: 'github',
    use_cases: ['Create PRs', 'Review code', 'Manage issues', 'Check CI status'],
    trigger_keywords: ['github', 'pr', 'pull request', 'commit', 'branch', 'merge', 'repository'],
    tools: [],
    enabled: true,
    is_public: true,
    version: '1.0.0',
    author: 'Friday Team',
  },
  {
    name: 'Email Agent',
    slug: 'email-agent',
    url: 'https://friday-email-agent.vercel.app/api/email',
    description: 'Helps draft and send emails, summarizes long email threads',
    icon: 'mail',
    use_cases: ['Draft emails', 'Summarize threads', 'Schedule sends', 'Reply suggestions'],
    trigger_keywords: ['email', 'mail', 'gmail', 'inbox', 'reply', 'send', 'compose'],
    tools: [],
    enabled: false,
    is_public: true,
    version: '1.0.0',
    author: 'Friday Team',
  },
];

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if agents already exist
    const { data: existing, error: checkError } = await supabase
      .from('agents')
      .select('slug');

    if (checkError) {
      return NextResponse.json(
        { success: false, error: checkError.message },
        { status: 500 }
      );
    }

    const existingSlugs = new Set(existing?.map((a) => a.slug) || []);
    const newAgents = sampleAgents.filter((a) => !existingSlugs.has(a.slug));

    if (newAgents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All sample agents already exist',
        count: 0,
      });
    }

    const { data, error } = await supabase.from('agents').insert(newAgents).select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${data?.length || 0} sample agents`,
      count: data?.length || 0,
      agents: data,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
