import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Phone, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  status: 'Active' | 'Inactive' | 'Blocked';
  lastSeen: string;
  createdAt: string;
  notes?: string;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+1234567890',
    email: 'john@example.com',
    tags: ['VIP', 'Customer'],
    status: 'Active',
    lastSeen: '2 hours ago',
    createdAt: '2024-01-15',
    notes: 'Interested in premium package',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '+1234567891',
    email: 'sarah@example.com',
    tags: ['Lead', 'Marketing'],
    status: 'Active',
    lastSeen: '1 day ago',
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    name: 'Mike Davis',
    phone: '+1234567892',
    tags: ['Customer'],
    status: 'Active',
    lastSeen: '5 minutes ago',
    createdAt: '2024-01-13',
    notes: 'Regular customer, prefers evening contact',
  },
  {
    id: '4',
    name: 'Emily Wilson',
    phone: '+1234567893',
    email: 'emily@example.com',
    tags: ['Prospect'],
    status: 'Inactive',
    lastSeen: '1 week ago',
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    name: 'Robert Brown',
    phone: '+1234567894',
    tags: ['Customer', 'Support'],
    status: 'Blocked',
    lastSeen: '2 weeks ago',
    createdAt: '2024-01-11',
    notes: 'Blocked due to spam complaints',
  },
];

export function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    tags: '',
    notes: '',
  });

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-whatsapp-green hover:bg-whatsapp-green';
      case 'Inactive':
        return 'bg-yellow-500 hover:bg-yellow-500';
      case 'Blocked':
        return 'bg-destructive hover:bg-destructive';
      default:
        return 'bg-secondary hover:bg-secondary';
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateContact = () => {
    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      email: newContact.email || undefined,
      tags: newContact.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      status: 'Active',
      lastSeen: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
      notes: newContact.notes || undefined,
    };
    
    setContacts(prev => [contact, ...prev]);
    setNewContact({ name: '', phone: '', email: '', tags: '', notes: '' });
    setIsCreateDialogOpen(false);
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Contacts</h1>
            <p className="text-muted-foreground mt-1">
              Manage your WhatsApp contacts and customer information
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newContact.tags}
                    onChange={(e) => setNewContact(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Customer, VIP, Lead"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={newContact.notes}
                    onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional information about this contact"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateContact}
                    disabled={!newContact.name || !newContact.phone}
                    className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white"
                  >
                    Add Contact
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts by name, phone, email, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Tags</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Last Seen</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact, index) => (
                  <tr
                    key={contact.id}
                    className={`border-b border-border ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-whatsapp-green text-white">
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {contact.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">{contact.phone}</td>
                    <td className="p-4 text-muted-foreground">{contact.email || '-'}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(contact.status)} text-white`}>
                        {contact.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{contact.lastSeen}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewContact(contact)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Phone className="h-4 w-4" />
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

      {/* View Contact Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-whatsapp-green text-white">
                  {selectedContact?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {selectedContact?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <p className="text-muted-foreground font-mono">{selectedContact.phone}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-muted-foreground">{selectedContact.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(selectedContact.status)} text-white`}>
                      {selectedContact.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Last Seen</Label>
                  <p className="text-muted-foreground">{selectedContact.lastSeen}</p>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <p className="text-muted-foreground">{selectedContact.createdAt}</p>
                </div>
                <div>
                  <Label>Contact ID</Label>
                  <p className="text-muted-foreground font-mono">{selectedContact.id}</p>
                </div>
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedContact.tags.map(tag => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedContact.notes && (
                <div>
                  <Label>Notes</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p>{selectedContact.notes}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
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