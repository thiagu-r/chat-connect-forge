import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Flow {
  id: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Draft';
  triggerType: string;
  description: string;
  createdAt: string;
  lastRun?: string;
}

const mockFlows: Flow[] = [
  {
    id: '1',
    name: 'Welcome Series',
    status: 'Active',
    triggerType: 'New Contact',
    description: 'Automated welcome sequence for new contacts',
    createdAt: '2024-01-15',
    lastRun: '2024-01-20',
  },
  {
    id: '2',
    name: 'Abandoned Cart',
    status: 'Active',
    triggerType: 'Event',
    description: 'Follow up on abandoned shopping carts',
    createdAt: '2024-01-14',
    lastRun: '2024-01-19',
  },
  {
    id: '3',
    name: 'Birthday Wishes',
    status: 'Draft',
    triggerType: 'Date',
    description: 'Send birthday messages to contacts',
    createdAt: '2024-01-13',
  },
  {
    id: '4',
    name: 'Product Launch',
    status: 'Inactive',
    triggerType: 'Manual',
    description: 'Announce new product launches',
    createdAt: '2024-01-12',
    lastRun: '2024-01-15',
  },
];

export function FlowsView() {
  const [flows, setFlows] = useState<Flow[]>(mockFlows);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [newFlow, setNewFlow] = useState({
    name: '',
    triggerType: '',
    description: '',
  });

  const getStatusColor = (status: Flow['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-whatsapp-green hover:bg-whatsapp-green';
      case 'Draft':
        return 'bg-yellow-500 hover:bg-yellow-500';
      case 'Inactive':
        return 'bg-gray-500 hover:bg-gray-500';
      default:
        return 'bg-secondary hover:bg-secondary';
    }
  };

  const handleCreateFlow = () => {
    const flow: Flow = {
      id: Date.now().toString(),
      name: newFlow.name,
      status: 'Draft',
      triggerType: newFlow.triggerType,
      description: newFlow.description,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setFlows(prev => [flow, ...prev]);
    setNewFlow({ name: '', triggerType: '', description: '' });
    setIsCreateDialogOpen(false);
  };

  const handleViewFlow = (flow: Flow) => {
    setSelectedFlow(flow);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Flows</h1>
            <p className="text-muted-foreground mt-1">
              Automate your WhatsApp messaging workflows
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Flow
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Flow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Flow Name</Label>
                  <Input
                    id="name"
                    value={newFlow.name}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter flow name"
                  />
                </div>
                <div>
                  <Label htmlFor="trigger">Trigger Type</Label>
                  <Input
                    id="trigger"
                    value={newFlow.triggerType}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, triggerType: e.target.value }))}
                    placeholder="e.g., New Contact, Event, Date"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={newFlow.description}
                    onChange={(e) => setNewFlow(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this flow does..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFlow}
                    disabled={!newFlow.name || !newFlow.triggerType || !newFlow.description}
                    className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white"
                  >
                    Create Flow
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Flows Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Flow Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Trigger</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Last Run</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flows.map((flow, index) => (
                  <tr
                    key={flow.id}
                    className={`border-b border-border ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
                  >
                    <td className="p-4 font-medium text-foreground">{flow.name}</td>
                    <td className="p-4 text-muted-foreground">{flow.triggerType}</td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(flow.status)} text-white`}>
                        {flow.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{flow.lastRun || 'Never'}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewFlow(flow)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Play className="h-4 w-4" />
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

      {/* View Flow Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedFlow?.name}</DialogTitle>
          </DialogHeader>
          {selectedFlow && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Trigger Type</Label>
                <p className="text-muted-foreground">{selectedFlow.triggerType}</p>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <Badge className={`${getStatusColor(selectedFlow.status)} text-white`}>
                    {selectedFlow.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p>{selectedFlow.description}</p>
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