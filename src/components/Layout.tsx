import { useState } from 'react';
import { MessageCircle, FileText, GitBranch, Megaphone, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'flows', label: 'Flows', icon: GitBranch },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'contacts', label: 'Contacts', icon: Users },
];

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-semibold text-foreground">WhatsApp CRM</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                  isActive 
                    ? "bg-sidebar-active text-whatsapp-dark-green" 
                    : "hover:bg-sidebar-hover text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-sm text-muted-foreground mb-3">
            Connected to WhatsApp Business
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}