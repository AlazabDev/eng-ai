import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings2, 
  User, 
  Palette, 
  MessageSquare, 
  Bell, 
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  Globe,
  Moon,
  Sun,
  Zap,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'ar' | 'en';
  aiResponseSpeed: number;
  enableNotifications: boolean;
  soundEnabled: boolean;
  autoSave: boolean;
  maxTokens: number;
  temperature: number;
  showTimestamps: boolean;
  compactMode: boolean;
  rightToLeft: boolean;
}

export const UserSettings = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'ar',
    aiResponseSpeed: 0.7,
    enableNotifications: true,
    soundEnabled: false,
    autoSave: true,
    maxTokens: 1000,
    temperature: 0.7,
    showTimestamps: true,
    compactMode: false,
    rightToLeft: true
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('user-preferences');
    if (saved) {
      setPreferences({ ...preferences, ...JSON.parse(saved) });
    }
  };

  const saveSettings = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('user-preferences', JSON.stringify(newPreferences));
    
    // Apply theme immediately
    applyTheme(newPreferences.theme);
    
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تطبيق إعداداتك بنجاح"
    });
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    saveSettings(newPreferences);
  };

  const exportSettings = async () => {
    setIsExporting(true);
    try {
      const dataStr = JSON.stringify(preferences, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم تصدير الإعدادات",
        description: "تم تنزيل ملف الإعدادات بنجاح"
      });
    } catch {
      toast({
        title: "خطأ في التصدير",
        description: "فشل في تصدير الإعدادات",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        saveSettings({ ...preferences, ...imported });
        toast({
          title: "تم استيراد الإعدادات",
          description: "تم تطبيق الإعدادات المستوردة بنجاح"
        });
      } catch {
        toast({
          title: "خطأ في الاستيراد",
          description: "ملف الإعدادات غير صحيح",
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const resetToDefaults = () => {
    const defaultPreferences: UserPreferences = {
      theme: 'system',
      language: 'ar',
      aiResponseSpeed: 0.7,
      enableNotifications: true,
      soundEnabled: false,
      autoSave: true,
      maxTokens: 1000,
      temperature: 0.7,
      showTimestamps: true,
      compactMode: false,
      rightToLeft: true
    };
    saveSettings(defaultPreferences);
    toast({
      title: "تمت إعادة التعيين",
      description: "تم استرجاع الإعدادات الافتراضية"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Settings2 className="w-6 h-6" />
          إعدادات المستخدم
        </h1>
        <p className="text-muted-foreground">
          خصص تجربتك مع منصة الدردشة الذكية
        </p>
      </div>

      {/* Profile & Language */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          الملف الشخصي واللغة
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>اللغة المفضلة</Label>
            <Select 
              value={preferences.language} 
              onValueChange={(value: 'ar' | 'en') => handlePreferenceChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>اتجاه النص من اليمين لليسار</Label>
              <Switch
                checked={preferences.rightToLeft}
                onCheckedChange={(checked) => handlePreferenceChange('rightToLeft', checked)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          المظهر والواجهة
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>السمة</Label>
            <Select 
              value={preferences.theme} 
              onValueChange={(value: 'light' | 'dark' | 'system') => handlePreferenceChange('theme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    الوضع الفاتح
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    الوضع الداكن
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    تلقائي حسب النظام
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>الوضع المضغوط</Label>
              <Switch
                checked={preferences.compactMode}
                onCheckedChange={(checked) => handlePreferenceChange('compactMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>إظهار الطوابع الزمنية</Label>
              <Switch
                checked={preferences.showTimestamps}
                onCheckedChange={(checked) => handlePreferenceChange('showTimestamps', checked)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* AI Chat Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          إعدادات الذكاء الاصطناعي
        </h3>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>سرعة الاستجابة</Label>
              <div className="px-3">
                <Slider
                  value={[preferences.aiResponseSpeed]}
                  onValueChange={([value]) => handlePreferenceChange('aiResponseSpeed', value)}
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>بطيء ودقيق</span>
                  <span>سريع وإبداعي</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                القيمة الحالية: {preferences.aiResponseSpeed}
              </Badge>
            </div>

            <div className="space-y-3">
              <Label>درجة الحرارة (الإبداع)</Label>
              <div className="px-3">
                <Slider
                  value={[preferences.temperature]}
                  onValueChange={([value]) => handlePreferenceChange('temperature', value)}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>منطقي</span>
                  <span>إبداعي</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                القيمة الحالية: {preferences.temperature}
              </Badge>
            </div>
          </div>

          <div>
            <Label>الحد الأقصى للرموز</Label>
            <Input
              type="number"
              value={preferences.maxTokens}
              onChange={(e) => handlePreferenceChange('maxTokens', parseInt(e.target.value))}
              min="100"
              max="4000"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              عدد أكبر = ردود أطول، لكن استهلاك أكثر للموارد
            </p>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          الإشعارات والصوت
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>تفعيل الإشعارات</Label>
              <p className="text-sm text-muted-foreground">الحصول على إشعارات للردود الجديدة</p>
            </div>
            <Switch
              checked={preferences.enableNotifications}
              onCheckedChange={(checked) => handlePreferenceChange('enableNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>تفعيل الأصوات</Label>
              <p className="text-sm text-muted-foreground">تشغيل أصوات للأحداث</p>
            </div>
            <Switch
              checked={preferences.soundEnabled}
              onCheckedChange={(checked) => handlePreferenceChange('soundEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>الحفظ التلقائي</Label>
              <p className="text-sm text-muted-foreground">حفظ المحادثات تلقائياً</p>
            </div>
            <Switch
              checked={preferences.autoSave}
              onCheckedChange={(checked) => handlePreferenceChange('autoSave', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          إدارة البيانات
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            onClick={exportSettings}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            تصدير الإعدادات
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <Button 
              variant="outline" 
              disabled={isImporting}
              className="w-full flex items-center gap-2"
            >
              {isImporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              استيراد الإعدادات
            </Button>
          </div>

          <Button 
            variant="destructive" 
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة تعيين
          </Button>
        </div>

        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            يتم حفظ جميع الإعدادات محلياً في متصفحك. لن يتم مشاركتها مع أي خدمة خارجية.
          </AlertDescription>
        </Alert>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          إجراءات سريعة
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              localStorage.removeItem('chat-messages');
              toast({ title: "تم مسح السجل", description: "تم حذف جميع المحادثات المحفوظة" });
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            مسح سجل المحادثات
          </Button>

          <Button 
            variant="outline" 
            onClick={() => {
              window.location.reload();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة تحميل التطبيق
          </Button>
        </div>
      </Card>
    </div>
  );
};
