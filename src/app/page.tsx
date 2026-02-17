'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
} from 'lucide-react';

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreate = async (data: CreateAgentInput) => {
    try {
      const { error } = await supabase.from('agents').insert([data]);
      if (error) throw error;
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
      const { error } = await supabase
        .from('agents')
        .update(data)
        .eq('id', editingAgent.id);
      if (error) throw error;
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
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agent.id);
      if (error) throw error;
      toast.success('Agent deleted');
      fetchAgents();
    } catch (error) {
      console.error('Failed to delete agent:', error);
      toast.error('Failed to delete agent');
    }
  };

  const handleToggle = async (agent: Agent) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ enabled: !agent.enabled })
        .eq('id', agent.id);
      if (error) throw error;
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
