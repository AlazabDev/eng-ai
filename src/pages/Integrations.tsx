import React from 'react';
import { IntegrationSetup } from '@/components/integrations/IntegrationSetup';
import { GitHubConnector } from '@/components/integrations/GitHubConnector';
import { DriveConnector } from '@/components/integrations/DriveConnector';
import { WhatsAppConnector } from '@/components/integrations/WhatsAppConnector';
import { Sidebar } from '@/components/layout/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Integrations = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="dashboard" className="max-w-6xl mx-auto space-y-6" dir="rtl">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="dashboard">لوحة الترسانة</TabsTrigger>
            <TabsTrigger value="setup">إدارة الإعدادات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">الترسانة الحية</h1>
              <p className="text-muted-foreground mb-6">استخدم التكاملات المفعلة مباشرة في مساحة العمل الخاصة بك.</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <GitHubConnector />
              <DriveConnector />
              <WhatsAppConnector />
            </div>
          </TabsContent>

          <TabsContent value="setup" className="mt-6">
            <IntegrationSetup />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Integrations;