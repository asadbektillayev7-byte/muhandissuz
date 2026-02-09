import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ArticlesAdmin from "./pages/admin/ArticlesAdmin";
import ArticleEditor from "./pages/admin/ArticleEditor";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin";
import TeamAdmin from "./pages/admin/TeamAdmin";
import MediaLibrary from "./pages/admin/MediaLibrary";
import ScientificArticlesAdmin from "./pages/admin/ScientificArticlesAdmin";
import MediaCornerAdmin from "./pages/admin/MediaCornerAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import CommentsAdmin from "./pages/admin/CommentsAdmin";
import AnalyticsAdmin from "./pages/admin/AnalyticsAdmin";
import SettingsAdmin from "./pages/admin/SettingsAdmin";
import LoginAdmin from "./pages/admin/LoginAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin/login" element={<LoginAdmin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="articles" element={<ArticlesAdmin />} />
                  <Route path="articles/new" element={<ArticleEditor />} />
                  <Route path="articles/:id/edit" element={<ArticleEditor />} />
                  <Route path="categories" element={<CategoriesAdmin />} />
                  <Route path="team" element={<TeamAdmin />} />
                  <Route path="media" element={<MediaLibrary />} />
                  <Route path="scientific-articles" element={<ScientificArticlesAdmin />} />
                  <Route path="media-corner" element={<MediaCornerAdmin />} />
                  <Route path="users" element={<UsersAdmin />} />
                  <Route path="comments" element={<CommentsAdmin />} />
                  <Route path="analytics" element={<AnalyticsAdmin />} />
                  <Route path="settings" element={<SettingsAdmin />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
