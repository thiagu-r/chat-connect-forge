import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Campaign {
  id: string;
  name: string;
  templateName: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Paused';
  contactCount: number;
  scheduledDate: string;
  createdAt: string;
  deliveredCount?: number;
  openRate?: number;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'New Year Promotion',
    templateName: 'Special Offer',
    status: 'Completed',
    contactCount: 1250,
    scheduledDate: '2024-01-01',
    createdAt: '2023-12-25',
    deliveredCount: 1245,
    openRate: 78.5,
  },
  {
    id: '2',
    name: 'Product Launch Announcement',
    templateName: 'Product Launch',
    status: 'In Progress',
    contactCount: 850,
    scheduledDate: '2024-01-20',
    createdAt: '2024-01-18',
    deliveredCount: 320,
    openRate: 82.1,
  },
  {
    id: '3',
    name: 'Customer Survey',
    templateName: 'Survey Request',
    status: 'Scheduled',
    contactCount: 500,
    scheduledDate: '2024-01-25',
    createdAt: '2024-01-19',
  },
  {
    id: '4',
    name: 'Holiday Greetings',
    templateName: 'Holiday Message',
    status: 'Paused',
    contactCount: 2000,
    scheduledDate: '2023-12-24',
    createdAt: '2023-12-20',
    deliveredCount: 1800,
    openRate: 85.2,
  },
];

const mockTemplates = [
  'Welcome Message',
  'Order Confirmation',
  'Special Offer',
  'Product Launch',
  'Survey Request',
  'Holiday Message',
];

export function CampaignsView() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    templateName: '',
    contactCount: '',
    scheduledDate: '',
  });

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-whatsapp-green hover:bg-whatsapp-green';
      case 'In Progress':
        return 'bg-blue-500 hover:bg-blue-500';
      case 'Scheduled':
        return 'bg-yellow-500 hover:bg-yellow-500';
      case 'Paused':
        return 'bg-gray-500 hover:bg-gray-500';
      default:
        return 'bg-secondary hover:bg-secondary';
    }
  };

  const handleCreateCampaign = () => {
    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      templateName: newCampaign.templateName,
      status: 'Scheduled',
      contactCount: parseInt(newCampaign.contactCount),
      scheduledDate: newCampaign.scheduledDate,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setCampaigns(prev => [campaign, ...prev]);
    setNewCampaign({ name: '', templateName: '', contactCount: '', scheduledDate: '' });
    setIsCreateDialogOpen(false);
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your WhatsApp marketing campaigns
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={newCampaign.templateName}
                    onValueChange={(value) => setNewCampaign(prev => ({ ...prev, templateName: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTemplates.map(template => (
                        <SelectItem key={template} value={template}>
                          {template}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contacts">Number of Contacts</Label>
                  <Input
                    id="contacts"
                    type="number"
                    value={newCampaign.contactCount}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, contactCount: e.target.value }))}
                    placeholder="Enter number of contacts"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Scheduled Date</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={newCampaign.scheduledDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCampaign}
                    disabled={!newCampaign.name || !newCampaign.templateName || !newCampaign.contactCount || !newCampaign.scheduledDate}
                    className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white"
                  >
                    Create Campaign
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Campaign Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Template</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Contacts</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Delivered</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Open Rate</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign, index) => (
                  <tr
                    key={campaign.id}
                    className={`border-b border-border ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
                  >
                    <td className="p-4 font-medium text-foreground">{campaign.name}</td>
                    <td className="p-4 text-muted-foreground">{campaign.templateName}</td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {campaign.contactCount.toLocaleString()}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {campaign.deliveredCount ? campaign.deliveredCount.toLocaleString() : '-'}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {campaign.openRate ? `${campaign.openRate}%` : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewCampaign(campaign)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Calendar className="h-4 w-4" />
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

      {/* View Campaign Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.name}</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Template Used</Label>
                  <p className="text-muted-foreground">{selectedCampaign.templateName}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(selectedCampaign.status)} text-white`}>
                      {selectedCampaign.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Total Contacts</Label>
                  <p className="text-muted-foreground">{selectedCampaign.contactCount.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Delivered</Label>
                  <p className="text-muted-foreground">
                    {selectedCampaign.deliveredCount ? selectedCampaign.deliveredCount.toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label>Scheduled Date</Label>
                  <p className="text-muted-foreground">{selectedCampaign.scheduledDate}</p>
                </div>
                <div>
                  <Label>Open Rate</Label>
                  <p className="text-muted-foreground">
                    {selectedCampaign.openRate ? `${selectedCampaign.openRate}%` : 'N/A'}
                  </p>
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