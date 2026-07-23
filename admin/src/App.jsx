import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RefundsPage from './pages/dashboard/RefundsPage';
import AgreementsPage from './pages/dashboard/AgreementsPage';
import ApplicantsPage from './pages/applicants/ApplicantsPage';
import ApplicantDetailPage from './pages/applicants/ApplicantDetailPage';
import ApplicantFormPage from './pages/applicants/ApplicantFormPage';
import ApplicantStatusUpdatePage from './pages/applicants/ApplicantStatusUpdatePage';
import SoftDeletedApplicantsPage from './pages/applicants/SoftDeletedApplicantsPage';
import StaffPage from './pages/staff/StaffPage';
import StaffFormPage from './pages/staff/StaffFormPage';
import StaffDetailPage from './pages/staff/StaffDetailPage';
import SubStaffDetailPage from './pages/staff/SubStaffDetailPage';
import SubStaffAllocationsPage from './pages/staff/SubStaffAllocationsPage';
import SlotsPage from './pages/staff/SlotsPage';
import CountriesConfigPage from './pages/config/CountriesConfigPage';
import CurrenciesConfigPage from './pages/config/CurrenciesConfigPage';
import CountryFormPage from './pages/config/CountryFormPage';
import CountryDetailPage from './pages/config/CountryDetailPage';
import VisasConfigPage from './pages/config/VisasConfigPage';
import VisaFormPage from './pages/config/VisaFormPage';
import VisaDetailPage from './pages/config/VisaDetailPage';
import JobsConfigPage from './pages/config/JobsConfigPage';
import JobFormPage from './pages/config/JobFormPage';
import JobDetailPage from './pages/config/JobDetailPage';
import SlotsConfigPage from './pages/config/SlotsConfigPage';
import SettingsLayout from './pages/settings/SettingsLayout';
import ProfilePage from './pages/settings/ProfilePage';
import CompanySettings from './pages/settings/CompanySettings';
import OfficesSettings from './pages/settings/OfficesSettings';
import DesignationsSettings from './pages/settings/DesignationsSettings';
import ApplicationStatusSettings from './pages/settings/ApplicationStatusSettings';
import ApplicantTagsSettings from './pages/settings/ApplicantTagsSettings';
import LawyersSettings from './pages/settings/LawyersSettings';
import EmailTemplatesSettings from './pages/settings/EmailTemplatesSettings';
import VisaCategoriesConfigPage from './pages/config/VisaCategoriesConfigPage';
import AgencyServicesPage from './pages/website/AgencyServicesPage';
import NoticesPage from './pages/website/NoticesPage';
import ReviewsPage from './pages/website/ReviewsPage';
import ContactMessagesPage from './pages/website/ContactMessagesPage';
import ApplicationRequestsPage from './pages/website/ApplicationRequestsPage';
import SocialLinksPage from './pages/website/SocialLinksPage';
import FakeLiveResultsPage from './pages/website/FakeLiveResultsPage';
import AgencyImagesPage from './pages/website/AgencyImagesPage';
import SendEmailPage from './pages/communication/SendEmailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Toaster position="top-right" />
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
                path="/profile"
                element={<AdminLayout><ProfilePage /></AdminLayout>}
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
                path="/applicants/statuses"
                element={<AdminLayout><ApplicantStatusUpdatePage /></AdminLayout>}
              />
              <Route
                path="/applicants/deleted"
                element={<AdminLayout><SoftDeletedApplicantsPage /></AdminLayout>}
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
                path="/staff/new"
                element={<AdminLayout><StaffFormPage /></AdminLayout>}
              />
              <Route
                path="/staff/allocations"
                element={<AdminLayout><SubStaffAllocationsPage /></AdminLayout>}
              />
              <Route
                path="/staff/:id"
                element={<AdminLayout><StaffDetailPage /></AdminLayout>}
              />
              <Route
                path="/staff/:id/edit"
                element={<AdminLayout><StaffFormPage /></AdminLayout>}
              />
              <Route
                path="/staff/:staffId/sub-staffs/:subStaffId"
                element={<AdminLayout><SubStaffDetailPage /></AdminLayout>}
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
                path="/config/currencies"
                element={<AdminLayout><CurrenciesConfigPage /></AdminLayout>}
              />
              <Route
                path="/config/countries/new"
                element={<AdminLayout><CountryFormPage /></AdminLayout>}
              />
              <Route
                path="/config/countries/:slug"
                element={<AdminLayout><CountryDetailPage /></AdminLayout>}
              />
              <Route
                path="/config/countries/:slug/edit"
                element={<AdminLayout><CountryFormPage /></AdminLayout>}
              />
              <Route
                path="/config/visas"
                element={<AdminLayout><VisasConfigPage /></AdminLayout>}
              />
              <Route
                path="/config/visas/new"
                element={<AdminLayout><VisaFormPage /></AdminLayout>}
              />
              <Route
                path="/config/visas/:id"
                element={<AdminLayout><VisaDetailPage /></AdminLayout>}
              />
              <Route
                path="/config/visas/:id/edit"
                element={<AdminLayout><VisaFormPage /></AdminLayout>}
              />
              <Route
                path="/config/visas/:visaId/jobs/new"
                element={<AdminLayout><JobFormPage /></AdminLayout>}
              />
              <Route
                path="/config/visas/:visaId/jobs/:jobId"
                element={<AdminLayout><JobDetailPage /></AdminLayout>}
              />
              <Route
                path="/config/visas/:visaId/jobs/:jobId/edit"
                element={<AdminLayout><JobFormPage /></AdminLayout>}
              />
              <Route
                path="/config/jobs"
                element={<AdminLayout><JobsConfigPage /></AdminLayout>}
              />
              <Route 
                path="/config/slots" 
                element={<AdminLayout><SlotsConfigPage /></AdminLayout>} 
              />
              <Route
                path="/config/visa-categories"
                element={<AdminLayout><VisaCategoriesConfigPage /></AdminLayout>}
              />
              <Route
                path="/website/services"
                element={<AdminLayout><AgencyServicesPage /></AdminLayout>}
              />
              <Route
                path="/website/notices"
                element={<AdminLayout><NoticesPage /></AdminLayout>}
              />
              <Route
                path="/website/reviews"
                element={<AdminLayout><ReviewsPage /></AdminLayout>}
              />
              <Route
                path="/website/messages"
                element={<AdminLayout><ContactMessagesPage /></AdminLayout>}
              />
              <Route
                path="/website/application-requests"
                element={<AdminLayout><ApplicationRequestsPage /></AdminLayout>}
              />
              <Route
                path="/website/social-links"
                element={<AdminLayout><SocialLinksPage /></AdminLayout>}
              />
              <Route
                path="/website/fake-live-results"
                element={<AdminLayout><FakeLiveResultsPage /></AdminLayout>}
              />
              <Route
                path="/website/agency-images"
                element={<AdminLayout><AgencyImagesPage /></AdminLayout>}
              />
              <Route
                path="/communication/send-email"
                element={<AdminLayout><SendEmailPage /></AdminLayout>}
              />
              <Route
                path="/communication/templates"
                element={<AdminLayout><EmailTemplatesSettings /></AdminLayout>}
              />
              <Route path="/settings" element={<AdminLayout><SettingsLayout /></AdminLayout>}>
                <Route path="company" element={<CompanySettings />} />
                <Route path="offices" element={<OfficesSettings />} />
                <Route path="designations" element={<DesignationsSettings />} />
                <Route path="statuses" element={<ApplicationStatusSettings />} />
                <Route path="tags" element={<ApplicantTagsSettings />} />
                <Route path="lawyers" element={<LawyersSettings />} />
              </Route>
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
