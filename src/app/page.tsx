'use client';

import { useEffect, useState } from 'react';
import { Agent, CreateAgentInput } from '@/types/agent';
import { AgentTable } from '@/components/agent-table';
import { AgentForm } from '@/components/agent-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Bot,
  Plus,
  Search,
  Loader2,
  RefreshCw,
  Blocks,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch agents');
      }

      setAgents(data || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to fetch agents:', err);
      setError(errorMsg);
      toast.error(`Failed to load agents: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const seedSampleAgents = async () => {
    setSeeding(true);
    try {
      const response = await fetch('/api/seed');
      const result = await response.json();
      if (result.success) {
        toast.success(`Seeded ${result.count} sample agents`);
        fetchAgents();
      } else {
        toast.error(result.error || 'Failed to seed agents');
      }
    } catch (err) {
      toast.error('Failed to seed agents');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreate = async (data: CreateAgentInput) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create agent');
      }

      toast.success('Agent created successfully');
      fetchAgents();
    } catch (error) {
      console.error('Failed to create agent:', error);
      toast.error('Failed to create agent');
      throw error;
    }
  };

  const handleEdit = async (data: CreateAgentInput) => {
    if (!editingAgent) return;
    try {
      const response = await fetch('/api/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingAgent.id, ...data }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update agent');
      }

      toast.success('Agent updated successfully');
      setEditingAgent(null);
      fetchAgents();
    } catch (error) {
      console.error('Failed to update agent:', error);
      toast.error('Failed to update agent');
      throw error;
    }
  };

  const handleDelete = async (agent: Agent) => {
    try {
      const response = await fetch(`/api/agents?id=${agent.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete agent');
      }

      toast.success('Agent deleted');
      fetchAgents();
    } catch (error) {
      console.error('Failed to delete agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  const handleToggle = async (agent: Agent) => {
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
      fetchAgents();
    } catch (error) {
      console.error('Failed to toggle agent:', error);
      toast.error('Failed to toggle agent');
    }
  };

  const filteredAgents = searchQuery
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : agents;

  const stats = {
    total: agents.length,
    enabled: agents.filter((a) => a.enabled).length,
    public: agents.filter((a) => a.is_public).length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                <Blocks className="h-5 w-5 text-background" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Friday Agent Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage and configure AI agents
                </p>
              </div>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Agent
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Bot className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Agents</div>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-background" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{stats.enabled}</div>
                <div className="text-sm text-muted-foreground">Enabled</div>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Blocks className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{stats.public}</div>
                <div className="text-sm text-muted-foreground">Public</div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Search & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={fetchAgents} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium mb-2">Failed to load agents</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">{error}</p>
            <Button variant="outline" onClick={fetchAgents}>
              Try Again
            </Button>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No agents yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Get started by creating your first agent or seed some sample agents.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={seedSampleAgents} disabled={seeding}>
                {seeding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Seed Sample Agents
              </Button>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </div>
          </div>
        ) : (
          <AgentTable
            agents={filteredAgents}
            onEdit={(agent) => setEditingAgent(agent)}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        )}
      </main>

      {/* Create Form */}
      <AgentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        mode="create"
      />

      {/* Edit Form */}
      {editingAgent && (
        <AgentForm
          open={!!editingAgent}
          onOpenChange={(open) => !open && setEditingAgent(null)}
          onSubmit={handleEdit}
          initialData={editingAgent}
          mode="edit"
        />
      )}
    </div>
  );
}
