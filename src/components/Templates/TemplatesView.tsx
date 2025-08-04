import { useState } from 'react';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Template {
  id: string;
  name: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  category: string;
  content: string;
  createdAt: string;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Welcome Message',
    status: 'Approved',
    category: 'Marketing',
    content: 'Welcome to our service! We\'re excited to have you on board.',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Order Confirmation',
    status: 'Approved',
    category: 'Transactional',
    content: 'Your order #{{order_id}} has been confirmed. Thank you for your purchase!',
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    name: 'Appointment Reminder',
    status: 'Pending',
    category: 'Utility',
    content: 'This is a reminder for your appointment on {{date}} at {{time}}.',
    createdAt: '2024-01-13',
  },
  {
    id: '4',
    name: 'Special Offer',
    status: 'Rejected',
    category: 'Marketing',
    content: 'Get 50% off on your next purchase! Use code: SAVE50',
    createdAt: '2024-01-12',
  },
];

export function TemplatesView() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: '',
    content: '',
  });

  const getStatusColor = (status: Template['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-whatsapp-green hover:bg-whatsapp-green';
      case 'Pending':
        return 'bg-yellow-500 hover:bg-yellow-500';
      case 'Rejected':
        return 'bg-destructive hover:bg-destructive';
      default:
        return 'bg-secondary hover:bg-secondary';
    }
  };

  const handleCreateTemplate = () => {
    const template: Template = {
      id: Date.now().toString(),
      name: newTemplate.name,
      status: 'Pending',
      category: newTemplate.category,
      content: newTemplate.content,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setTemplates(prev => [template, ...prev]);
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
              <Button className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Transactional">Transactional</SelectItem>
                      <SelectItem value="Utility">Utility</SelectItem>
                      <SelectItem value="Authentication">Authentication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Template Content</Label>
                  <Textarea
                    id="content"
                    rows={6}
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your template content..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTemplate}
                    disabled={!newTemplate.name || !newTemplate.category || !newTemplate.content}
                    className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white"
                  >
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Templates Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Template Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
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
                    <td className="p-4">
                      <Badge className={`${getStatusColor(template.status)} text-white`}>
                        {template.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{template.createdAt}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Template Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Category</Label>
                <p className="text-muted-foreground">{selectedTemplate.category}</p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <Badge className={`${getStatusColor(selectedTemplate.status)} text-white`}>
                    {selectedTemplate.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Content</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedTemplate.content}</p>
                </div>
              </div>
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