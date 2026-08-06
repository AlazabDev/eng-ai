import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Github,
  HardDrive,
  Users,
  Key,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Settings2,
  ShieldCheck,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { integrationStorage } from '@/lib/integration-storage';
import { useIntegrationStore } from '@/store/useIntegrationStore';

interface IntegrationConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  setupInstructions: string[];
}

const INTEGRATION_DEFS: IntegrationConfig[] = [
  {
    id: 'github',
    name: 'GitHub',
    icon: <Github className="w-5 h-5" />,
    description: 'اربط مستودعات GitHub عبر أسرار محفوظة على الخادم فقط',
    setupInstructions: [
      'لا تضع Personal Access Token داخل المتصفح.',
      'ضع قيمة السر داخل Supabase Secrets أو مزود أسرار الخادم.',
      'اكتب هنا اسم السر فقط مثل GITHUB_PAT.',
      'أي اختبار اتصال يجب أن يتم من Edge Function وليس من الواجهة.',
    ],
  },
  {
    id: 'drive',
    name: 'Google Drive',
    icon: <HardDrive className="w-5 h-5" />,
    description: 'ربط Google Drive عبر OAuth/Secrets من الخادم',
    setupInstructions: [
      'فعّل Google Drive API من Google Cloud.',
      'خزّن Client Secret في الخادم فقط.',
      'اكتب أسماء الأسرار فقط داخل secret_refs.',
      'استخدم Redirect/OAuth flow آمن من Backend عند التنفيذ.',
    ],
  },
  {
    id: 'company',
    name: 'خادم الشركة',
    icon: <Users className="w-5 h-5" />,
    description: 'ربط API الشركة بدون حفظ مفاتيح خام داخل المتصفح',
    setupInstructions: [
      'اكتب endpoint عام غير حساس إن احتجت.',
      'خزّن مفاتيح الوصول في Supabase Secrets.',
      'اكتب اسم السر فقط مثل COMPANY_API_KEY.',
      'نفّذ الاتصال من Edge Function مع سجل تدقيق.',
    ],
  },
];

function parseKeyValueDraft(value: string): Record<string, string> {
  return Object.fromEntries(
    value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [key, ...rest] = line.split('=');
        return [key.trim(), rest.join('=').trim()];
      })
      .filter(([key, val]) => key && val),
  );
}

function toKeyValueDraft(value: Record<string, string>): string {
  return Object.entries(value || {}).map(([key, val]) => `${key}=${val}`).join('\n');
}

function settingLabel(key: string, value: unknown): string {
  const labels: Record<string, string> = {
    autoSync: 'مزامنة تلقائية',
    includePrivate: 'تضمين المستودعات الخاصة',
    enableCaching: 'تفعيل التخزين المؤقت',
    maxRepos: `الحد الأقصى للمستودعات: ${value}`,
    maxFiles: `الحد الأقصى للملفات: ${value}`,
    timeout: `مهلة الاتصال: ${value}s`,
    retryAttempts: `محاولات الإعادة: ${value}`,
  };

  return labels[key] || key;
}

export const IntegrationSetup = (): JSX.Element => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('github');
  const [secretDrafts, setSecretDrafts] = useState<Record<string, string>>({});
  const [metadataDrafts, setMetadataDrafts] = useState<Record<string, string>>({});

  const { integrations, loadIntegrations, testConnection } = useIntegrationStore();

  useEffect(() => {
    integrationStorage.purgeSecrets();
    loadIntegrations();
  }, [loadIntegrations]);

  useEffect(() => {
    const sDrafts: Record<string, string> = {};
    const mDrafts: Record<string, string> = {};
    Object.values(integrations).forEach(integ => {
      sDrafts[integ.id] = toKeyValueDraft(integ.secretRefs);
      mDrafts[integ.id] = toKeyValueDraft(integ.publicMetadata);
    });
    setSecretDrafts(sDrafts);
    setMetadataDrafts(mDrafts);
  }, [integrations]);

  const saveIntegration = (integrationId: string, status: 'connected' | 'disconnected' | 'error' = 'connected') => {
    const integration = integrations[integrationId];
    if (!integration) return;

    const secretRefs = parseKeyValueDraft(secretDrafts[integrationId] || '');
    const publicMetadata = parseKeyValueDraft(metadataDrafts[integrationId] || '');

    integrationStorage.save({
      id: integrationId,
      status: status as any,
      settings: integration.settings || {},
      secretRefs,
      publicMetadata,
      connectedAt: status === 'connected' ? new Date().toISOString() : undefined,
    });

    loadIntegrations();
    window.dispatchEvent(new Event('integrations-updated'));
    toast({
      title: status === 'connected' ? 'تم حفظ مرجع التكامل' : 'تم تحديث التكامل',
      description: 'تم حفظ أسماء الأسرار فقط بدون أي قيم حساسة.',
    });
  };

  const handleDisconnect = (integrationId: string) => {
    integrationStorage.remove(integrationId);
    loadIntegrations();
    window.dispatchEvent(new Event('integrations-updated'));
    toast({ title: 'تم قطع الاتصال', description: 'تم حذف حالة التكامل من المتصفح.' });
  };

  const handleSettingChange = (integrationId: string, setting: string, value: any) => {
    const integration = integrations[integrationId];
    if (!integration) return;

    const newSettings = { ...integration.settings, [setting]: value };
    integrationStorage.save({
      id: integrationId,
      status: integration.status as any,
      settings: newSettings,
      secretRefs: integration.secretRefs,
      publicMetadata: integration.publicMetadata,
      connectedAt: integration.status === 'connected' ? new Date().toISOString() : undefined,
    });
    loadIntegrations();
  };

  const handleTestConnection = async (integrationId: string) => {
    const success = await testConnection(integrationId);
    if (success) {
      toast({
        title: "تم الاتصال بنجاح",
        description: "الخدمة مستجيبة والاتصال آمن.",
      });
    } else {
      toast({
        title: "فشل الاتصال",
        description: "الخدمة لا تستجيب، تأكد من الإعدادات.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1" />متصل</Badge>;
      case 'error':
        return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20"><AlertCircle className="w-3 h-3 mr-1" />فشل الاتصال</Badge>;
      case 'testing':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />جاري الفحص...</Badge>;
      default:
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">غير متصل</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" dir="rtl">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">ترسانة التكاملات (Integrations Arsenal)</h1>
        <p className="text-muted-foreground">لوحة تحكم مركزية لربط وفحص وإدارة الخدمات الخارجية المساعدة لمنصة العزب</p>
      </div>

      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3 text-sm">
          <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="font-semibold">سياسة الإنتاج الصارمة</p>
            <p className="text-muted-foreground">هذه الصفحة تحفظ أسماء الأسرار المرجعية فقط. يجب أن تكون المفاتيح الفعلية مسجلة في (Azure Key Vault) أو Backend.</p>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {INTEGRATION_DEFS.map((def) => (
            <TabsTrigger key={def.id} value={def.id} className="flex items-center gap-2">
              {def.icon}
              {def.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {INTEGRATION_DEFS.map(def => {
          const state = integrations[def.id] || { status: 'disconnected', settings: {} };
          return (
            <TabsContent key={def.id} value={def.id}>
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">{def.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{def.name}</h3>
                      <p className="text-sm text-muted-foreground">{def.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(state.status)}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTestConnection(def.id)}
                      disabled={state.status === 'testing'}
                    >
                      {state.status === 'testing' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
                      فحص الاتصال (Ping)
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2"><Settings2 className="w-4 h-4" />خطوات الإعداد</h4>
                    <ol className="space-y-2 text-sm">
                      {def.setupInstructions.map((step, index) => (
                        <li key={step} className="flex gap-3">
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{index + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <Button
                      onClick={() => window.open(def.id === 'github' ? 'https://github.com/settings/tokens' : def.id === 'drive' ? 'https://console.cloud.google.com' : '#', '_blank')}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />فتح لوحة الخدمة
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2"><Key className="w-4 h-4" />مراجع آمنة</h4>
                    <div className="space-y-2">
                      <Label>secret_refs</Label>
                      <textarea
                        dir="ltr"
                        className="w-full min-h-28 rounded-md border bg-background px-3 py-2 text-sm font-mono"
                        value={secretDrafts[def.id] || ''}
                        onChange={e => setSecretDrafts(prev => ({ ...prev, [def.id]: e.target.value }))}
                        placeholder="token=GITHUB_PAT"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>public metadata</Label>
                      <textarea
                        dir="ltr"
                        className="w-full min-h-24 rounded-md border bg-background px-3 py-2 text-sm font-mono"
                        value={metadataDrafts[def.id] || ''}
                        onChange={e => setMetadataDrafts(prev => ({ ...prev, [def.id]: e.target.value }))}
                        placeholder="endpoint=https://api.example.com"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveIntegration(def.id)} className="flex-1">حفظ الإعدادات</Button>
                      <Button onClick={() => handleDisconnect(def.id)} variant="outline">قطع</Button>
                    </div>
                  </div>
                </div>

                {state.status === 'connected' && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-4">إعدادات متقدمة للتكامل</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(state.settings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between gap-4">
                          <Label className="text-sm">{settingLabel(key, value)}</Label>
                          {typeof value === 'boolean' && (
                            <Switch checked={value} onCheckedChange={(checked) => handleSettingChange(def.id, key, checked)} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
