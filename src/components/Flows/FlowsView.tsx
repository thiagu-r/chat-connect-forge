import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Play, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchFlows, fetchFlow, Flow, FlowScreen, FlowComponent } from '@/lib/api';
import { useApi } from '@/hooks/useApi';

export function FlowsView() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newFlow, setNewFlow] = useState({
    name: '',
    triggerType: '',
    description: '',
  });

  const { useAuthenticatedQuery } = useApi();

  // Fetch flows using React Query
  const { data: flowsData, isLoading: isLoadingFlows, error: flowsError } = useAuthenticatedQuery(
    ['flows'],
    '/flows/',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Update flows when data changes
  useEffect(() => {
    if (flowsData?.results) {
      setFlows(flowsData.results);
    }
    if (flowsError) {
      setError('Failed to load flows');
    }
    setIsLoading(false);
  }, [flowsData, flowsError]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-whatsapp-green hover:bg-whatsapp-green';
      case 'DRAFT':
        return 'bg-yellow-500 hover:bg-yellow-500';
      case 'INACTIVE':
        return 'bg-gray-500 hover:bg-gray-500';
      default:
        return 'bg-secondary hover:bg-secondary';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getComponentTypeLabel = (componentType: string): string => {
    switch (componentType) {
      case 'screen':
        return 'Screen';
      case 'text_input':
        return 'Text Input';
      case 'date_picker':
        return 'Date Picker';
      case 'radio_button_group':
        return 'Radio Buttons';
      case 'footer':
        return 'Footer';
      default:
        return componentType;
    }
  };

  const handleCreateFlow = () => {
    // Note: Flow creation would need to be implemented via API
    // For now, we'll just close the dialog
    setNewFlow({ name: '', triggerType: '', description: '' });
    setIsCreateDialogOpen(false);
  };

  const handleViewFlow = async (flow: Flow) => {
    try {
      // Fetch detailed flow information
      const detailedFlow = await fetchFlow(flow.id);
      setSelectedFlow(detailedFlow);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error fetching flow details:', error);
      // Fallback to basic flow info
      setSelectedFlow(flow);
      setIsViewDialogOpen(true);
    }
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
              <Button 
                className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white"
                disabled
                title="Flow creation via API not implemented yet"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Flow
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Flow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-lg font-semibold mb-2">Flow Creation Not Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Flow creation via the API is not implemented yet. Flows are managed through the WhatsApp Business API.
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

      {/* Flows Table */}
      <div className="flex-1 overflow-auto p-6">
        {isLoadingFlows ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading flows...</p>
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
                    <th className="text-left p-4 font-medium text-muted-foreground">Flow Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Flow ID</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Categories</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Created</th>
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
                      <td className="p-4 text-muted-foreground text-sm">{flow.flow_id}</td>
                      <td className="p-4 text-muted-foreground">
                        <div className="flex flex-wrap gap-1">
                          {flow.categories.map((category, catIndex) => (
                            <Badge key={catIndex} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(flow.status)} text-white`}>
                          {flow.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{formatDate(flow.created_at)}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewFlow(flow)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" disabled>
                            <Play className="h-4 w-4" />
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
            {flows.length === 0 && !isLoadingFlows && (
              <div className="p-8 text-center text-muted-foreground">
                <p>No flows found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Flow Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFlow?.name}
              <Badge variant="secondary">{selectedFlow?.flow_id}</Badge>
              <Badge className={getStatusColor(selectedFlow?.status || '')}>
                {selectedFlow?.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedFlow && (
            <div className="space-y-6 py-4">
              {/* Flow Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Flow ID</Label>
                  <p className="text-muted-foreground text-sm">{selectedFlow.flow_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedFlow.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-muted-foreground text-sm">{formatDate(selectedFlow.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <p className="text-muted-foreground text-sm">{formatDate(selectedFlow.updated_at)}</p>
                </div>
              </div>

              {/* Routing Model */}
              {Object.keys(selectedFlow.routing_model).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Flow Routing</Label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedFlow.routing_model).map(([screen, nextScreens]) => (
                      <div key={screen} className="p-3 bg-muted rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{screen}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {nextScreens.length > 0 ? nextScreens.join(', ') : 'End'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Screens */}
              {selectedFlow.screens && selectedFlow.screens.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Flow Screens</Label>
                  <div className="mt-2 space-y-4">
                    {selectedFlow.screens.map((screen, index) => (
                      <Card key={screen.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <span>{screen.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {screen.screen_id}
                            </Badge>
                            {screen.terminal && (
                              <Badge variant="destructive" className="text-xs">
                                Terminal
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {screen.components.map((component) => (
                              <div key={component.id} className="p-2 bg-gray-50 rounded text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">
                                    {getComponentTypeLabel(component.component_type)}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    Order: {component.order}
                                  </Badge>
                                </div>
                                {component.config.text && (
                                  <p className="text-muted-foreground text-xs">
                                    {component.config.text}
                                  </p>
                                )}
                                {component.config.label && (
                                  <p className="text-muted-foreground text-xs">
                                    Label: {component.config.label}
                                  </p>
                                )}
                                {component.config.name && (
                                  <p className="text-muted-foreground text-xs">
                                    Field: {component.config.name}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Errors */}
              {selectedFlow.validation_errors && selectedFlow.validation_errors.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-destructive">Validation Errors</Label>
                  <div className="mt-2 space-y-1">
                    {selectedFlow.validation_errors.map((error, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {error}
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