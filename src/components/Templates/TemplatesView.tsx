import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTemplates, fetchTemplate, Template, TemplateComponent } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

export function TemplatesView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: '',
    content: '',
  });

  const { useAuthenticatedQuery } = useApi();

  // Fetch templates using React Query
  const { data: templatesData, isLoading: isLoadingTemplates, error: templatesError } = useAuthenticatedQuery(
    ['templates'],
    '/templates/',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Update templates when data changes
  useEffect(() => {
    if (templatesData?.results) {
      setTemplates(templatesData.results);
    }
    if (templatesError) {
      setError('Failed to load templates');
    }
    setIsLoading(false);
  }, [templatesData, templatesError]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-whatsapp-green hover:bg-whatsapp-green';
      case 'PENDING':
        return 'bg-yellow-500 hover:bg-yellow-500';
      case 'REJECTED':
        return 'bg-destructive hover:bg-destructive';
      default:
        return 'bg-secondary hover:bg-secondary';
    }
  };

  const formatTemplateContent = (components: TemplateComponent[]): string => {
    return components.map(component => {
      switch (component.type) {
        case 'HEADER':
          return component.text || '[Header]';
        case 'BODY':
          return component.text || '[Body]';
        case 'FOOTER':
          return component.text || '[Footer]';
        case 'BUTTONS':
          return component.buttons?.map(btn => btn.text).join(', ') || '[Buttons]';
        default:
          return '';
      }
    }).filter(Boolean).join('\n\n');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateTemplate = () => {
    // Note: Template creation would need to be implemented via API
    // For now, we'll just close the dialog
    setNewTemplate({ name: '', category: '', content: '' });
    setIsCreateDialogOpen(false);
  };

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Templates</h1>
            <p className="text-muted-foreground mt-1">
              Manage your WhatsApp message templates
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white"
                disabled
                title="Template creation via API not implemented yet"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-lg font-semibold mb-2">Template Creation Not Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Template creation via the API is not implemented yet. Templates are managed through the WhatsApp Business API.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Templates Table */}
      <div className="flex-1 overflow-auto p-6">
        {isLoadingTemplates ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Template Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Language</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Created</th>
                    <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template, index) => (
                    <tr
                      key={template.id}
                      className={`border-b border-border ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
                    >
                      <td className="p-4 font-medium text-foreground">{template.name}</td>
                      <td className="p-4 text-muted-foreground">{template.category}</td>
                      <td className="p-4 text-muted-foreground">{template.language}</td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(template.status)} text-white`}>
                          {template.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{formatDate(template.created_at)}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewTemplate(template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {templates.length === 0 && !isLoadingTemplates && (
              <div className="p-8 text-center text-muted-foreground">
                <p>No templates found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Template Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.name}
              <Badge variant="secondary">{selectedTemplate?.category}</Badge>
              <Badge className={getStatusColor(selectedTemplate?.status || '')}>
                {selectedTemplate?.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-6 py-4">
              {/* Template Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Template ID</Label>
                  <p className="text-muted-foreground text-sm">{selectedTemplate.template_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Language</Label>
                  <p className="text-muted-foreground text-sm">{selectedTemplate.language}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-muted-foreground text-sm">{formatDate(selectedTemplate.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <p className="text-muted-foreground text-sm">{formatDate(selectedTemplate.updated_at)}</p>
                </div>
              </div>

              {/* Template Components */}
              <div>
                <Label className="text-sm font-medium">Template Components</Label>
                <div className="mt-2 space-y-3">
                  {selectedTemplate.components.map((component, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {component.type}
                          {component.format && (
                            <Badge variant="outline" className="text-xs">
                              {component.format}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {component.text && (
                          <div className="mb-3">
                            <Label className="text-xs text-muted-foreground">Content</Label>
                            <div className="mt-1 p-3 bg-muted rounded text-sm whitespace-pre-wrap">
                              {component.text}
                            </div>
                          </div>
                        )}
                        {component.buttons && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Buttons</Label>
                            <div className="mt-1 space-y-1">
                              {component.buttons.map((button, btnIndex) => (
                                <div key={btnIndex} className="p-2 bg-blue-50 rounded text-sm">
                                  <div className="font-medium">{button.text}</div>
                                  <div className="text-xs text-muted-foreground">Type: {button.type}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Parameters */}
              {selectedTemplate.payload_structure.parameters.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Parameters</Label>
                  <div className="mt-2 space-y-2">
                    {selectedTemplate.payload_structure.parameters.map((param, index) => (
                      <div key={index} className="p-3 bg-muted rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{param.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {param.type}
                          </Badge>
                        </div>
                        {param.description && (
                          <p className="text-xs text-muted-foreground mb-1">{param.description}</p>
                        )}
                        {param.example && (
                          <p className="text-xs text-muted-foreground">Example: {param.example}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}