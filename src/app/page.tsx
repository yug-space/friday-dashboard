'use client';

import { useEffect, useState } from 'react';
import { Agent, CreateAgentInput } from '@/types/agent';
import { DashboardLayout } from '@/components/dashboard-layout';
import { AgentCard } from '@/components/agent-card';
import { AgentForm } from '@/components/agent-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Bot,
  Plus,
  Search,
  Loader2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  List,
  Zap,
  Globe,
} from 'lucide-react';
import { AgentTable } from '@/components/agent-table';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

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

  const filteredAgents = agents
    .filter((a) => {
      if (filter === 'enabled') return a.enabled;
      if (filter === 'disabled') return !a.enabled;
      return true;
    })
    .filter(
      (a) =>
        !searchQuery ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: agents.length,
    enabled: agents.filter((a) => a.enabled).length,
    public: agents.filter((a) => a.is_public).length,
  };

  return (
    <DashboardLayout onAddAgent={() => setFormOpen(true)}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor your AI agents
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Agents</p>
                <p className="text-3xl font-semibold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active</p>
                <p className="text-3xl font-semibold">{stats.enabled}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Public</p>
                <p className="text-3xl font-semibold">{stats.public}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Inactive</p>
                <p className="text-3xl font-semibold">{stats.total - stats.enabled}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Bot className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', viewMode === 'grid' && 'bg-muted')}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8', viewMode === 'list' && 'bg-muted')}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={fetchAgents} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
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
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-card">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
            <p className="text-muted-foreground max-w-md mb-8">
              Get started by creating your first agent or seed some sample agents to explore.
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
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEdit={(a) => setEditingAgent(a)}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        ) : (
          <AgentTable
            agents={filteredAgents}
            onEdit={(agent) => setEditingAgent(agent)}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        )}
      </div>

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
    </DashboardLayout>
  );
}
