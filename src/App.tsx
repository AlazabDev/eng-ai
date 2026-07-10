import { lazy, Suspense, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const WhatsApp = lazy(() => import("./pages/WhatsApp"));
const Azure = lazy(() => import("./pages/Azure"));
const AzureSettings = lazy(() => import("./pages/AzureSettings"));
const AzureContextPage = lazy(() => import("./pages/azure/AzureContextPage"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VisionOCR = lazy(() => import("./pages/services/VisionOCR"));
const DocumentIntelligence = lazy(() => import("./pages/services/DocumentIntelligence"));
const AIProcessing = lazy(() => import("./pages/services/AIProcessing"));
const MaintenanceSearch = lazy(() => import("./pages/services/MaintenanceSearch"));
const QAAgent = lazy(() => import("./pages/services/QAAgent"));
const ArchERP = lazy(() => import("./pages/services/ArchERP"));
const EngineeringTools = lazy(() => import("./pages/EngineeringTools"));
const ProductivityTools = lazy(() => import("./pages/ProductivityTools"));
const ArchitectureAnalysis = lazy(() => import("./pages/ArchitectureAnalysis"));
const FinanceAnalysis = lazy(() => import("./pages/FinanceAnalysis"));
const FinanceModule = lazy(() => import("./pages/finance/FinanceModule"));
const ContractsGenerator = lazy(() => import("./pages/tools/ContractsGenerator"));
const SmartReports = lazy(() => import("./pages/tools/SmartReports"));
const TaskBoard = lazy(() => import("./pages/tools/TaskBoard"));
const SpeechStudio = lazy(() => import("./pages/SpeechStudio"));

const queryClient = new QueryClient();

const UserOnly = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const AdminOnly = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requireAdmin>{children}</ProtectedRoute>
);

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/auth" element={<Auth />} />

                <Route path="/" element={<UserOnly><Index /></UserOnly>} />
                <Route path="/settings" element={<UserOnly><Settings /></UserOnly>} />
                <Route path="/services/vision" element={<UserOnly><VisionOCR /></UserOnly>} />
                <Route path="/services/docint" element={<UserOnly><DocumentIntelligence /></UserOnly>} />
                <Route path="/services/ai-processing" element={<UserOnly><AIProcessing /></UserOnly>} />
                <Route path="/services/search" element={<UserOnly><MaintenanceSearch /></UserOnly>} />
                <Route path="/services/agent" element={<UserOnly><QAAgent /></UserOnly>} />
                <Route path="/services/arch-erp" element={<UserOnly><ArchERP /></UserOnly>} />
                <Route path="/engineering" element={<UserOnly><EngineeringTools /></UserOnly>} />
                <Route path="/productivity" element={<UserOnly><ProductivityTools /></UserOnly>} />
                <Route path="/architecture" element={<UserOnly><ArchitectureAnalysis /></UserOnly>} />
                <Route path="/tools/tasks" element={<UserOnly><TaskBoard /></UserOnly>} />
                <Route path="/tools/speech" element={<UserOnly><SpeechStudio /></UserOnly>} />

                <Route path="/integrations" element={<AdminOnly><Integrations /></AdminOnly>} />
                <Route path="/analytics" element={<AdminOnly><Analytics /></AdminOnly>} />
                <Route path="/whatsapp" element={<AdminOnly><WhatsApp /></AdminOnly>} />
                <Route path="/azure" element={<AdminOnly><Azure /></AdminOnly>} />
                <Route path="/azure/settings" element={<AdminOnly><AzureSettings /></AdminOnly>} />
                <Route path="/azure/vision" element={<AdminOnly><AzureContextPage contextId="vision" /></AdminOnly>} />
                <Route path="/azure/finance" element={<AdminOnly><AzureContextPage contextId="finance" /></AdminOnly>} />
                <Route path="/azure/agents/maintenance" element={<AdminOnly><AzureContextPage contextId="maintenance-agent" /></AdminOnly>} />
                <Route path="/azure/agents/production" element={<AdminOnly><AzureContextPage contextId="production-agent" /></AdminOnly>} />
                <Route path="/azure/speech" element={<AdminOnly><AzureContextPage contextId="speech-voice" /></AdminOnly>} />
                <Route path="/finance" element={<AdminOnly><FinanceAnalysis /></AdminOnly>} />
                <Route path="/finance/module" element={<AdminOnly><FinanceModule /></AdminOnly>} />
                <Route path="/tools/contracts" element={<AdminOnly><ContractsGenerator /></AdminOnly>} />
                <Route path="/tools/reports" element={<AdminOnly><SmartReports /></AdminOnly>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
