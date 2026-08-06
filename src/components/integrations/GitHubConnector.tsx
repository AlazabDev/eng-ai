import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Github, RefreshCw, FolderGit2, Star, GitBranch } from 'lucide-react';
import { useIntegrationStore } from '@/store/useIntegrationStore';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  default_branch: string;
  language: string;
}

export const GitHubConnector = () => {
  const { integrations } = useIntegrationStore();
  const github = integrations['github'];
  const { toast } = useToast();
  
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(github?.publicMetadata?.owner || '');

  const isConnected = github?.status === 'connected';

  const fetchRepositories = async () => {
    if (!username) {
      toast({ title: 'خطأ', description: 'يرجى إدخال اسم المستخدم (Owner)', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // In a real application, you would pass the stored Secret Ref to a secure Supabase Edge Function.
      // Here, we simulate a public API call for demonstration.
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
      
      if (!response.ok) {
        throw new Error('فشل جلب المستودعات');
      }

      const data = await response.json();
      setRepos(data);
      
      toast({ title: 'نجاح', description: `تم جلب ${data.length} مستودع بنجاح` });
    } catch (error: any) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <Github className="w-12 h-12 text-muted-foreground opacity-50" />
          <div className="text-center">
            <h3 className="text-lg font-medium">GitHub غير متصل</h3>
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
          <Github className="w-5 h-5" />
          مستودعات GitHub المرتبطة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder="اسم المستخدم أو المؤسسة (مثال: AlazabDev)" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={fetchRepositories} disabled={loading}>
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <FolderGit2 className="w-4 h-4 mr-2" />}
            جلب المستودعات
          </Button>
        </div>

        {repos.length > 0 && (
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="grid gap-3 md:grid-cols-2">
              {repos.map(repo => (
                <Card key={repo.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-primary truncate max-w-[200px]" title={repo.name}>
                      {repo.name}
                    </h4>
                    {repo.language && (
                      <Badge variant="secondary" className="text-[10px]">
                        {repo.language}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-8 mb-3">
                    {repo.description || 'لا يوجد وصف'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" /> {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" /> {repo.default_branch}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
