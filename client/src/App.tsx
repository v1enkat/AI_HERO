import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/app/DashboardPage';
import { ProductivityPage } from './pages/app/ProductivityPage';
import { SchedulerPage } from './pages/app/SchedulerPage';
import { LearningPage } from './pages/app/LearningPage';
import { HomePage } from './pages/app/HomePage';
import { FinancePage } from './pages/app/FinancePage';
import { LeadershipPage } from './pages/app/LeadershipPage';
import { BrandingPage } from './pages/app/BrandingPage';
import { WellnessPage } from './pages/app/WellnessPage';
import { AIChatPage } from './pages/app/AIChatPage';
import { SettingsPage } from './pages/app/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="productivity" element={<ProductivityPage />} />
          <Route path="scheduler" element={<SchedulerPage />} />
          <Route path="learning" element={<LearningPage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="leadership" element={<LeadershipPage />} />
          <Route path="branding" element={<BrandingPage />} />
          <Route path="wellness" element={<WellnessPage />} />
          <Route path="aichat" element={<AIChatPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
