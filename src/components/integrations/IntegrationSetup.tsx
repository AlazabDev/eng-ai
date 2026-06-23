import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Github,
  HardDrive,
  Users,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Settings2,
  KeyRound,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationStorage } from '@/lib/integration-storage';

interface IntegrationConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  setupInstructions: string[];
  settings: Record<string, any>;
  defaultSecretRefs: Record<string, string>;
}

const DEFAULT_INTEGRATIONS: Array<Omit<IntegrationConfig, 'status' | 'settings'>> = [
  {
    id: 'github',
    name: 'GitHub',
    icon: <Github className="w-5 h-5" />,
    description: 'ربط مستودعات GitHub عبر Edge Function أو GitHub App، بدون تخزين PAT في المتصفح.',
    defaultSecretRefs: { token: 'GITHUB_TOKEN' },
    setupInstructions: [
      'ضع GitHub token أو GitHub App credentials داخل Supabase Secrets أو مزود أسرار آمن.',
      'لا تحفظ Personal Access Token داخل المتصفح أو localStorage.',
      'استخدم Edge Function وسيطة لتنفيذ عمليات GitHub عند الحاجة.',
      'هذه الشاشة تحفظ حالة الربط واسم السر فقط، لا تحفظ قيمة السر.',
    ],
  },
  {
    id: 'drive',
    name: 'Google Drive',
    icon: <HardDrive className="w-5 h-5" />,
    description: 'ربط Google Drive عبر OAuth آمن من الخادم، بدون حفظ client secret في المتصفح.',
    defaultSecretRefs: { client_id: 'GOOGLE_DRIVE_CLIENT_ID', client_secret: 'GOOGLE_DRIVE_CLIENT_SECRET' },
    setupInstructions: [
      'ضع OAuth Client ID/Secret داخل Supabase Secrets أو مزود أسرار آمن.',
      'لا تحفظ client secret في localStorage.',
      'نفّذ OAuth callback من Edge Function أو backend فقط.',
      'هذه الشاشة تحفظ أسماء الأسرار وحالة الربط فقط.',
    ],
  },
  {
    id: 'company',
    name: 'خادم الشركة',
    icon: <Users className="w-5 h-5" />,
    description: 'ربط API الشركة الداخلي من خلال proxy آمن، بدون إرسال API key من المتصفح.',
    defaultSecretRefs: { api_key: 'COMPANY_API_KEY' },
    setupInstructions: [
      'ضع مفتاح API الشركة داخل Supabase Secrets.',
      'احفظ هنا endpoint العام فقط إن لم يكن حساساً.',
      'أي طلب فعلي يجب أن يمر عبر Edge Function وليس مباشرة من المتصفح.',
      'استخدم سياسات وصول وAudit Logs قبل تفعيل الإنتاج.',
    ],
  },
];

const DEFAULT_SETTINGS: Record<string, Record<string, any>> = {
  github: { autoSync: true, maxRepos: 50, includePrivate: false },
  drive: { autoSync: true, maxFiles: 1000 },
  company: { timeout: 30, retryAttempts: 3, enableCaching: true },
};

export const IntegrationSetup = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('github');
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [secretRefDrafts, setSecretRefDrafts] = useState<Record<string, string>>({});
  const [endpointDrafts, setEndpointDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    integrationStorage.purgeSecrets();
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    const configs = DEFAULT_INTEGRATIONS.map(def => {
      const saved = integrationStorage.load(def.id);
      return {
        ...def,
        status: saved?.status || 'disconnected' as const,
        settings: saved?.settings || DEFAULT_SETTINGS[def.id] || {},
      };
    });
    setIntegrations(configs);

    setSecretRefDrafts(Object.fromEntries(
      DEFAULT_INTEGRATIONS.map(def => [def.id, JSON.stringify(integrationStorage.load(def.id)?.secretRefs || def.defaultSecretRefs, null, 2)])
    ));
    setEndpointDrafts(Object.fromEntries(
      DEFAULT_INTEGRATIONS.map(def => [def.id, integrationStorage.load(def.id)?.publicMetadata?.endpoint || ''])
    ));
  };

  const parseSecretRefs = (integrationId: string): Record<string, string> => {
    const raw = secretRefDrafts[integrationId] || '{}';
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Secret refs must be a JSON object');
    return parsed as Record<string, string>;
  };

  const handleConnect = (integrationId: string) => {
    try {
      const secretRefs = parseSecretRefs(integrationId);
      const integration = integrations.find(i => i.id === integrationId);
      integrationStorage.save({
        id: integrationId,
        status: 'connected',
        settings: integration?.settings || DEFAULT_SETTINGS[integrationId] || {},
        secretRefs,
        publicMetadata: endpointDrafts[integrationId] ? { endpoint: endpointDrafts[integrationId] } : undefined,
        connectedAt: new Date().toISOString(),
      });
      loadIntegrations();
      window.dispatchEvent(new Event('integrations-updated'));
      toast({
        title: 'تم حفظ بيانات الربط الآمن',
        description: 'تم حفظ حالة الربط وأسماء الأسرار فقط. القيم الفعلية يجب أن تكون في Supabase Secrets.',
      });
    } catch (error) {
      integrationStorage.save({
        id: integrationId,
        status: 'error',
        settings: integrations.find(i => i.id === integrationId)?.settings || {},
      });
      loadIntegrations();
      window.dispatchEvent(new Event('integrations-updated'));
      toast({
        title: 'فشل حفظ إعدادات الربط',
        description: error instanceof Error ? error.message : 'تحقق من JSON',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = (integrationId: string) => {
    integrationStorage.remove(integrationId);
    loadIntegrations();
    window.dispatchEvent(new Event('integrations-updated'));
    toast({ title: 'تم قطع الاتصال', description: 'تم مسح حالة الربط المحلية بدون التعامل مع أي أسرار.' });
  };

  const handleSettingChange = (integrationId: string, setting: string, value: any) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    const newSettings = { ...integration.settings, [setting]: value };
    const saved = integrationStorage.load(integrationId);
    integrationStorage.save({
      id: integrationId,
      status: saved?.status || 'disconnected',
      settings: newSettings,
      secretRefs: saved?.secretRefs,
      publicMetadata: saved?.publicMetadata,
      connectedAt: saved?.connectedAt,
    });

    setIntegrations(prev =>
      prev.map(i => i.id === integrationId ? { ...i, settings: newSettings } : i)
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1" />متصل آمن</Badge>;
      case 'error':
        return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20"><AlertCircle className="w-3 h-3 mr-1" />خطأ</Badge>;
      default:
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">غير متصل</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">إعداد التكاملات الآمن</h1>
        <p className="text-muted-foreground">
          هذه الصفحة لا تحفظ مفاتيح API أو OAuth Secrets في المتصفح. احفظ القيم الفعلية في Supabase Secrets فقط.
        </p>
      </div>

      <Card className="p-4 border-amber-500/40 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">سياسة الأسرار</p>
            <p>لا يتم تخزين GitHub tokens أو Google client secrets أو API keys داخل localStorage. يتم حفظ أسماء الأسرار فقط مثل <code dir="ltr">GITHUB_TOKEN</code>.</p>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {integrations.map(integration => (
            <TabsTrigger key={integration.id} value={integration.id} className="flex items-center gap-2">
              {integration.icon}
              {integration.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {integrations.map(integration => (
          <TabsContent key={integration.id} value={integration.id}>
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2"><Settings2 className="w-4 h-4" />خطوات الإعداد</h4>
                  <ol className="space-y-2 text-sm">
                    {integration.setupInstructions.map((step, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2"><KeyRound className="w-4 h-4" />بيانات الربط الآمن</h4>

                  <div className="space-y-2">
                    <Label>Secret refs JSON</Label>
                    <textarea
                      dir="ltr"
                      className="w-full min-h-28 rounded-md border bg-background p-3 text-xs font-mono"
                      value={secretRefDrafts[integration.id] || '{}'}
                      onChange={e => setSecretRefDrafts(prev => ({ ...prev, [integration.id]: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">أسماء الأسرار فقط، وليس قيم الأسرار.</p>
                  </div>

                  {integration.id === 'company' && (
                    <div className="space-y-2">
                      <Label>Public Endpoint Metadata</Label>
                      <Input
                        dir="ltr"
                        value={endpointDrafts[integration.id] || ''}
                        onChange={e => setEndpointDrafts(prev => ({ ...prev, [integration.id]: e.target.value }))}
                        placeholder="https://api.company.example"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <h5 className="text-sm font-medium">إعدادات</h5>
                    {Object.entries(integration.settings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <Label className="text-sm">{key}</Label>
                        {typeof value === 'boolean' ? (
                          <Switch checked={value} onCheckedChange={checked => handleSettingChange(integration.id, key, checked)} />
                        ) : (
                          <Input
                            className="w-24 h-8"
                            value={String(value)}
                            onChange={e => handleSettingChange(integration.id, key, isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => handleConnect(integration.id)} className="flex-1">
                      حفظ الربط الآمن
                    </Button>
                    {integration.status === 'connected' && (
                      <Button variant="outline" onClick={() => handleDisconnect(integration.id)}>
                        قطع الاتصال
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
