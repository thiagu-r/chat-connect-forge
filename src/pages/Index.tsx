import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { MessagesView } from '@/components/Messages/MessagesView';
import { TemplatesView } from '@/components/Templates/TemplatesView';
import { FlowsView } from '@/components/Flows/FlowsView';
import { CampaignsView } from '@/components/Campaigns/CampaignsView';
import { ContactsView } from '@/components/Contacts/ContactsView';

const Index = () => {
  const [currentView, setCurrentView] = useState('messages');

  const renderView = () => {
    switch (currentView) {
      case 'messages':
        return <MessagesView />;
      case 'templates':
        return <TemplatesView />;
      case 'flows':
        return <FlowsView />;
      case 'campaigns':
        return <CampaignsView />;
      case 'contacts':
        return <ContactsView />;
      default:
        return <MessagesView />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default Index;
