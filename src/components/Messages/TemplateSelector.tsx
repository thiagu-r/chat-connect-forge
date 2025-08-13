import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchTemplates, sendTemplateMessage, Template, TemplateParameter } from '@/lib/api';

interface TemplateSelectorProps {
  contactId: number;
  onClose: () => void;
  onMessageSent: (message: any) => void;
}

export function TemplateSelector({ contactId, onClose, onMessageSent }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchTemplates();
        setTemplates(response.results);
      } catch (err) {
        setError('Failed to load templates');
        console.error('Error loading templates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Reset parameters when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialParams: Record<string, string> = {};
      selectedTemplate.payload_structure.parameters.forEach(param => {
        initialParams[param.name] = '';
      });
      setParameters(initialParams);
    } else {
      setParameters({});
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    setSelectedTemplate(template || null);
  };

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleSendTemplate = async () => {
    if (!selectedTemplate || !contactId) return;

    // Validate required parameters
    const requiredParams = selectedTemplate.payload_structure.parameters;
    const missingParams = requiredParams.filter(param => !parameters[param.name]?.trim());
    
    if (missingParams.length > 0) {
      setError(`Please fill in all required parameters: ${missingParams.map(p => p.name).join(', ')}`);
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await sendTemplateMessage(selectedTemplate.id, contactId, parameters);
      onMessageSent(response);
      onClose();
    } catch (err) {
      setError('Failed to send template message');
      console.error('Error sending template:', err);
    } finally {
      setIsSending(false);
    }
  };

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <span>Template Preview</span>
            <Badge variant="secondary">{selectedTemplate.category}</Badge>
            <Badge variant={selectedTemplate.status === 'APPROVED' ? 'default' : 'destructive'}>
              {selectedTemplate.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {selectedTemplate.components.map((component, index) => (
            <div key={index} className="text-sm">
              {component.type === 'HEADER' && component.text && (
                <div className="font-semibold text-base">{component.text}</div>
              )}
              {component.type === 'BODY' && component.text && (
                <div className="text-gray-700">{component.text}</div>
              )}
              {component.type === 'FOOTER' && component.text && (
                <div className="text-xs text-gray-500 mt-2">{component.text}</div>
              )}
              {component.type === 'BUTTONS' && component.buttons && (
                <div className="mt-2 space-y-1">
                  {component.buttons.map((button, btnIndex) => (
                    <div key={btnIndex} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {button.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderParameterInputs = () => {
    if (!selectedTemplate) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Template Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedTemplate.payload_structure.parameters.map((param) => (
            <div key={param.name} className="space-y-1">
              <Label htmlFor={param.name} className="text-sm font-medium">
                {param.name}
                {param.example && (
                  <span className="text-xs text-gray-500 ml-2">
                    (e.g., {param.example})
                  </span>
                )}
              </Label>
              <Input
                id={param.name}
                type={param.type === 'url' ? 'url' : 'text'}
                placeholder={param.description}
                value={parameters[param.name] || ''}
                onChange={(e) => handleParameterChange(param.name, e.target.value)}
                className="text-sm"
              />
              {param.description && (
                <p className="text-xs text-gray-500">{param.description}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Select Template</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Template Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Choose a template</Label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading templates...</div>
                ) : (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs text-gray-500">
                          {template.category} • {template.language}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Template Preview */}
          {renderTemplatePreview()}

          {/* Parameter Inputs */}
          {renderParameterInputs()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSendTemplate}
            disabled={!selectedTemplate || isSending}
            className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Template
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
