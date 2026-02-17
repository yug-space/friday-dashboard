import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET',
    },
  };

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      ...debug,
      status: 'error',
      error: 'Missing Supabase configuration',
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Simple query
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, slug, enabled, is_public')
      .limit(10);

    debug.agentsQuery = {
      success: !agentsError,
      error: agentsError?.message,
      count: agents?.length || 0,
      data: agents,
    };

    // Test 2: Check table structure
    const { data: schema, error: schemaError } = await supabase
      .from('agents')
      .select('*')
      .limit(1);

    debug.schemaCheck = {
      success: !schemaError,
      error: schemaError?.message,
      columns: schema?.[0] ? Object.keys(schema[0]) : [],
    };

    return NextResponse.json({
      ...debug,
      status: agentsError ? 'error' : 'ok',
    });
  } catch (err) {
    return NextResponse.json({
      ...debug,
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
