import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, File as FileIcon, ExternalLink, RefreshCw } from 'lucide-react';
import { useIntegrationStore } from '@/store/useIntegrationStore';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export const DriveConnector = () => {
  const { integrations } = useIntegrationStore();
  const drive = integrations['drive'];
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ id: string, name: string, type: string }[]>([]);

  const isConnected = drive?.status === 'connected';

  const simulateGooglePicker = async () => {
    setLoading(true);
    try {
      // Simulate OAuth flow & Google Picker interaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockFiles = [
        { id: '1', name: 'Engineering_Report_2024.pdf', type: 'application/pdf' },
        { id: '2', name: 'Architectural_Diagram_V2.dxf', type: 'application/dxf' },
        { id: '3', name: 'Financial_Quarter_Q3.xlsx', type: 'application/vnd.ms-excel' },
      ];
      
      setFiles(mockFiles);
      toast({ title: 'نجاح', description: 'تم استيراد الملفات من Google Drive بنجاح' });
    } catch {
      toast({ title: 'خطأ', description: 'فشل استيراد الملفات', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <HardDrive className="w-12 h-12 text-muted-foreground opacity-50" />
          <div className="text-center">
            <h3 className="text-lg font-medium">Google Drive غير متصل</h3>
            <p className="text-sm text-muted-foreground mt-1">يرجى الذهاب إلى إعدادات التكامل وربط حسابك أولاً.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          ملفات Google Drive
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={simulateGooglePicker} disabled={loading} className="w-full">
          {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
          فتح Google Picker واستيراد الملفات
        </Button>

        {files.length > 0 && (
          <ScrollArea className="h-[250px] w-full rounded-md border p-4">
            <div className="space-y-3">
              {files.map(file => (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-medium text-sm truncate">{file.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{file.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
