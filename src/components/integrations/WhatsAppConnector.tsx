import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useIntegrationStore } from '@/store/useIntegrationStore';
import { useToast } from '@/hooks/use-toast';

export const WhatsAppConnector = () => {
  const { integrations } = useIntegrationStore();
  const company = integrations['company']; // We can use the company integration or create a new 'whatsapp' one. Let's assume WhatsApp uses company for now, or we just mock it.
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  // Just a check to see if any integration is set up, representing general connectivity
  const isConnected = Object.values(integrations).some(i => i.status === 'connected');

  const handleSendReport = async () => {
    if (!phoneNumber || !message) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رقم الهاتف والرسالة', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Simulate sending WhatsApp message via API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({ 
        title: 'تم الإرسال بنجاح', 
        description: `تم إرسال التقرير الآلي إلى الرقم ${phoneNumber}`,
      });
      setMessage('');
    } catch (error) {
      toast({ title: 'فشل الإرسال', description: 'تأكد من إعدادات Twilio/WhatsApp API', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <MessageSquare className="w-12 h-12 text-muted-foreground opacity-50" />
          <div className="text-center">
            <h3 className="text-lg font-medium">WhatsApp غير متصل</h3>
            <p className="text-sm text-muted-foreground mt-1">يجب تفعيل تكامل API الشركة للتمكن من إرسال التقارير.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          إرسال تقرير آلي (WhatsApp)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input 
            placeholder="رقم الهاتف (بصيغة دولية مثال: +2010...)" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            dir="ltr"
            className="text-left"
          />
        </div>
        <div className="space-y-2">
          <Input 
            placeholder="رسالة التقرير السريعة..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button onClick={handleSendReport} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
          {loading ? <CheckCircle2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          إرسال التقرير
        </Button>
      </CardContent>
    </Card>
  );
};
