'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconSelector } from './icons';
import { Agent, CreateAgentInput } from '@/types/agent';
import { Loader2, Plus, X } from 'lucide-react';

interface AgentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAgentInput) => Promise<void>;
  initialData?: Agent;
  mode: 'create' | 'edit';
}

export function AgentForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: AgentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAgentInput>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    url: initialData?.url || '',
    description: initialData?.description || '',
    icon: initialData?.icon || 'bot',
    use_cases: initialData?.use_cases || [''],
    trigger_keywords: initialData?.trigger_keywords || [''],
    tools: initialData?.tools || [],
    enabled: initialData?.enabled ?? true,
    is_public: initialData?.is_public ?? true,
    version: initialData?.version || '1.0.0',
    author: initialData?.author || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Filter out empty use cases and keywords
      const cleanedData = {
        ...formData,
        use_cases: formData.use_cases.filter((uc) => uc.trim() !== ''),
        trigger_keywords: formData.trigger_keywords.filter((kw) => kw.trim() !== ''),
      };
      await onSubmit(cleanedData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const addUseCase = () => {
    setFormData((prev) => ({
      ...prev,
      use_cases: [...prev.use_cases, ''],
    }));
  };

  const removeUseCase = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      use_cases: prev.use_cases.filter((_, i) => i !== index),
    }));
  };

  const updateUseCase = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      use_cases: prev.use_cases.map((uc, i) => (i === index ? value : uc)),
    }));
  };

  const addKeyword = () => {
    setFormData((prev) => ({
      ...prev,
      trigger_keywords: [...prev.trigger_keywords, ''],
    }));
  };

  const removeKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      trigger_keywords: prev.trigger_keywords.filter((_, i) => i !== index),
    }));
  };

  const updateKeyword = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      trigger_keywords: prev.trigger_keywords.map((kw, i) =>
        i === index ? value : kw
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Agent' : 'Edit Agent'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new AI agent for Friday'
              : 'Update the agent configuration'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="My Agent"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                      slug: prev.slug || generateSlug(e.target.value),
                    }));
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="my-agent"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Endpoint URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://api.example.com/agent"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this agent do?"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  placeholder="1.0.0"
                  value={formData.version}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, version: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Your name"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, author: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconSelector
              value={formData.icon}
              onChange={(icon) => setFormData((prev) => ({ ...prev, icon }))}
            />
          </div>

          {/* Use Cases */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Use Cases</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addUseCase}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.use_cases.map((useCase, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="e.g., Track GitHub issues"
                    value={useCase}
                    onChange={(e) => updateUseCase(index, e.target.value)}
                  />
                  {formData.use_cases.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUseCase(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Keywords */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Trigger Keywords</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addKeyword}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Keywords that trigger this agent when detected in user activity
            </p>
            <div className="space-y-2">
              {formData.trigger_keywords.map((keyword, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="e.g., github, issue, pr"
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                  />
                  {formData.trigger_keywords.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKeyword(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.enabled ? 'enabled' : 'disabled'}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, enabled: v === 'enabled' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select
                value={formData.is_public ? 'public' : 'private'}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, is_public: v === 'public' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Create Agent' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
