import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RefundsPage from './pages/dashboard/RefundsPage';
import AgreementsPage from './pages/dashboard/AgreementsPage';
import ApplicantsPage from './pages/applicants/ApplicantsPage';
import ApplicantDetailPage from './pages/applicants/ApplicantDetailPage';
import ApplicantFormPage from './pages/applicants/ApplicantFormPage';
import StaffPage from './pages/staff/StaffPage';
import SlotsPage from './pages/staff/SlotsPage';
import CountriesConfigPage from './pages/config/CountriesConfigPage';
import VisasConfigPage from './pages/config/VisasConfigPage';
import JobsConfigPage from './pages/config/JobsConfigPage';
import FaqsConfigPage from './pages/config/FaqsConfigPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public auth route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected admin routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/dashboard"
                element={<AdminLayout><DashboardPage /></AdminLayout>}
              />
              <Route
                path="/refunds"
                element={<AdminLayout><RefundsPage /></AdminLayout>}
              />
              <Route
                path="/agreements"
                element={<AdminLayout><AgreementsPage /></AdminLayout>}
              />
              <Route
                path="/applicants"
                element={<AdminLayout><ApplicantsPage /></AdminLayout>}
              />
              <Route
                path="/applicants/new"
                element={<AdminLayout><ApplicantFormPage /></AdminLayout>}
              />
              <Route
                path="/applicants/:id/edit"
                element={<AdminLayout><ApplicantFormPage /></AdminLayout>}
              />
              <Route
                path="/applicants/:id"
                element={<AdminLayout><ApplicantDetailPage /></AdminLayout>}
              />
              <Route
                path="/staff"
                element={<AdminLayout><StaffPage /></AdminLayout>}
              />
              <Route
                path="/slots"
                element={<AdminLayout><SlotsPage /></AdminLayout>}
              />
              <Route
                path="/config/countries"
                element={<AdminLayout><CountriesConfigPage /></AdminLayout>}
              />
              <Route
                path="/config/visas"
                element={<AdminLayout><VisasConfigPage /></AdminLayout>}
              />
              <Route
                path="/config/jobs"
                element={<AdminLayout><JobsConfigPage /></AdminLayout>}
              />
              <Route
                path="/config/faqs"
                element={<AdminLayout><FaqsConfigPage /></AdminLayout>}
              />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
