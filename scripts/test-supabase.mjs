#!/usr/bin/env node

/**
 * Test script to verify Supabase connection and list agents
 */

const SUPABASE_URL = 'https://hfgvimjnzmxmmmcfjguy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-XTxpifCbdR5PwqZjr0HDQ_rve2fKDh';

async function testSupabase() {
  console.log('Testing Supabase connection...\n');
  console.log('URL:', SUPABASE_URL);
  console.log('Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...\n');

  try {
    // Test 1: List all agents (no filters)
    console.log('=== Test 1: Fetching ALL agents ===');
    const allAgentsRes = await fetch(`${SUPABASE_URL}/rest/v1/agents?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', allAgentsRes.status, allAgentsRes.statusText);
    const allAgents = await allAgentsRes.json();
    console.log('Total agents:', Array.isArray(allAgents) ? allAgents.length : 'Error');

    if (allAgentsRes.ok && Array.isArray(allAgents)) {
      if (allAgents.length > 0) {
        console.log('\nAgents found:');
        allAgents.forEach((agent, i) => {
          console.log(`  ${i + 1}. ${agent.name} (${agent.slug})`);
          console.log(`     - enabled: ${agent.enabled}, is_public: ${agent.is_public}`);
          console.log(`     - url: ${agent.url}`);
        });
      } else {
        console.log('\nNo agents in database. Need to create some!');
      }
    } else {
      console.log('Error response:', JSON.stringify(allAgents, null, 2));
    }

    // Test 2: List public + enabled agents (what the dashboard queries)
    console.log('\n=== Test 2: Fetching public & enabled agents ===');
    const publicAgentsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/agents?select=*&is_public=eq.true&enabled=eq.true`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Status:', publicAgentsRes.status, publicAgentsRes.statusText);
    const publicAgents = await publicAgentsRes.json();
    console.log('Public & enabled agents:', Array.isArray(publicAgents) ? publicAgents.length : 'Error');

    // Test 3: Check table schema
    console.log('\n=== Test 3: Check if agents table exists ===');
    const schemaRes = await fetch(
      `${SUPABASE_URL}/rest/v1/agents?select=id&limit=0`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact',
        },
      }
    );

    const count = schemaRes.headers.get('content-range');
    console.log('Table exists:', schemaRes.ok);
    console.log('Content-Range header:', count);

    return { allAgents, publicAgents };
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Run the test
testSupabase().then((result) => {
  if (result) {
    console.log('\n=== Summary ===');
    console.log('Connection: OK');
    console.log('All agents count:', result.allAgents?.length || 0);
    console.log('Public agents count:', result.publicAgents?.length || 0);

    if (!result.allAgents?.length) {
      console.log('\n⚠️  No agents found! You need to insert some agents into the database.');
      console.log('\nExample SQL to insert a test agent:');
      console.log(`
INSERT INTO agents (name, slug, url, description, icon, use_cases, trigger_keywords, enabled, is_public, version, author)
VALUES (
  'Code Suggester',
  'code-suggester',
  'https://your-agent-url.com/api/suggest',
  'Suggests code improvements based on your current context',
  'code',
  ARRAY['Code suggestions', 'Refactoring help', 'Bug fixes'],
  ARRAY['code', 'function', 'class', 'error', 'bug'],
  true,
  true,
  '1.0.0',
  'Friday Team'
);
      `);
    }
  }
});
