'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Agent, CreateAgentInput } from '@/types/agent';
import { AgentForm } from '@/components/agent-form';
import { AgentIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Pencil,
  Play,
  Loader2,
  ExternalLink,
  Power,
  Clock,
  User,
  Globe,
  Tag,
} from 'lucide-react';

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchAgent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setAgent(data);
    } catch (error) {
      console.error('Failed to fetch agent:', error);
      toast.error('Failed to load agent');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchAgent();
    }
  }, [params.id]);

  const handleEdit = async (data: CreateAgentInput) => {
    if (!agent) return;
    try {
      const { error } = await supabase
        .from('agents')
        .update(data)
        .eq('id', agent.id);
      if (error) throw error;
      toast.success('Agent updated successfully');
      setEditOpen(false);
      fetchAgent();
    } catch (error) {
      console.error('Failed to update agent:', error);
      toast.error('Failed to update agent');
      throw error;
    }
  };

  const handleToggle = async () => {
    if (!agent) return;
    try {
      const { error } = await supabase
        .from('agents')
        .update({ enabled: !agent.enabled })
        .eq('id', agent.id);
      if (error) throw error;
      toast.success(agent.enabled ? 'Agent disabled' : 'Agent enabled');
      fetchAgent();
    } catch (error) {
      console.error('Failed to toggle agent:', error);
      toast.error('Failed to toggle agent');
    }
  };

  const handleTest = async () => {
    if (!agent || !testInput.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch(agent.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: testInput,
          context: 'Test from dashboard',
        }),
      });
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Agent not found</h2>
          <Button onClick={() => router.push('/')}>Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                    agent.enabled
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <AgentIcon icon={agent.icon} size="lg" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">
                    {agent.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">{agent.slug}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleToggle}>
                <Power className="h-4 w-4 mr-2" />
                {agent.enabled ? 'Disable' : 'Enable'}
              </Button>
              <Button onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{agent.description}</p>
              </CardContent>
            </Card>

            {/* Use Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Use Cases</CardTitle>
                <CardDescription>
                  What this agent can help you with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agent.use_cases.map((useCase, i) => (
                    <Badge key={i} variant="secondary">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trigger Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Trigger Keywords</CardTitle>
                <CardDescription>
                  Keywords that activate this agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agent.trigger_keywords.map((keyword, i) => (
                    <Badge key={i} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Test Agent */}
            <Card>
              <CardHeader>
                <CardTitle>Test Agent</CardTitle>
                <CardDescription>
                  Send a test command to the agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a test command..."
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && testInput.trim()) {
                        handleTest();
                      }
                    }}
                  />
                  <Button onClick={handleTest} disabled={testing || !testInput.trim()}>
                    {testing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {testResult && (
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                      {testResult}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">State</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        agent.enabled ? 'bg-foreground' : 'bg-muted-foreground'
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {agent.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Visibility
                  </span>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {agent.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle>Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {agent.version && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Version
                    </span>
                    <Badge variant="outline">{agent.version}</Badge>
                  </div>
                )}
                {agent.author && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Author
                      </span>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{agent.author}</span>
                      </div>
                    </div>
                  </>
                )}
                {agent.created_at && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Created
                      </span>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(agent.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle>Endpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                    {agent.url}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(agent.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Form */}
      <AgentForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEdit}
        initialData={agent}
        mode="edit"
      />
    </div>
  );
}
