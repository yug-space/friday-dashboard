'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Agent, CreateAgentInput } from '@/types/agent';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AgentForm } from '@/components/agent-form';
import { AgentIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
  Copy,
  Check,
  Terminal,
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
  const [copied, setCopied] = useState(false);

  const fetchAgent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents');
      const agents = await response.json();

      if (!response.ok) {
        throw new Error(agents.error || 'Failed to fetch agents');
      }

      const foundAgent = agents.find((a: Agent) => a.id === params.id);
      if (!foundAgent) {
        throw new Error('Agent not found');
      }

      setAgent(foundAgent);
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
      const response = await fetch('/api/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agent.id, ...data }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update agent');
      }

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
      const response = await fetch('/api/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: agent.id, enabled: !agent.enabled }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to toggle agent');
      }

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-xl font-semibold mb-4">Agent not found</h2>
          <Button onClick={() => router.push('/')}>Go back</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  agent.enabled
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <AgentIcon icon={agent.icon} size="lg" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {agent.name}
                  </h1>
                  {agent.enabled ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{agent.slug}</p>
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

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {agent.description}
                </p>
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
                  {agent.use_cases?.map((useCase, i) => (
                    <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
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
                  Keywords that activate this agent automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agent.trigger_keywords?.map((keyword, i) => (
                    <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                      <Tag className="h-3 w-3 mr-1.5" />
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Test Agent */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Test Agent
                </CardTitle>
                <CardDescription>
                  Send a test command to the agent endpoint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter a test command or context..."
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  rows={3}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleTest}
                  disabled={testing || !testInput.trim()}
                  className="w-full"
                >
                  {testing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Test
                    </>
                  )}
                </Button>
                {testResult && (
                  <div className="relative">
                    <pre className="bg-muted rounded-xl p-4 text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-80">
                      {testResult}
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => copyToClipboard(testResult)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
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
                        agent.enabled ? 'bg-green-500' : 'bg-muted-foreground'
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {agent.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Visibility</span>
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
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {agent.version && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Version</span>
                    <Badge variant="outline">{agent.version}</Badge>
                  </div>
                )}
                {agent.author && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Author</span>
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
                      <span className="text-sm text-muted-foreground">Created</span>
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
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 text-xs font-mono truncate">
                    {agent.url}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyToClipboard(agent.url)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => window.open(agent.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <AgentForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEdit}
        initialData={agent}
        mode="edit"
      />
    </DashboardLayout>
  );
}
