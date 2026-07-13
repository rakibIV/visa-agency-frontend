import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import VisaDetailPage from './pages/VisaDetailPage';
import StatusCheckPage from './pages/StatusCheckPage';
import MonthlySlotsPage from './pages/MonthlySlotsPage';
import VisaUpdatesPage from './pages/VisaUpdatesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NoticesPage from './pages/NoticesPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        
        <Route path="countries" element={<CountriesPage />} />
        <Route path="countries/:slug" element={<CountryDetailPage />} />
        
        <Route path="visas/:slug" element={<VisaDetailPage />} />
        
        <Route path="status-check" element={<StatusCheckPage />} />
        
        <Route path="monthly-slots" element={<MonthlySlotsPage />} />
        
        <Route path="visa-updates" element={<VisaUpdatesPage />} />
        
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="notices" element={<NoticesPage />} />
        
        {/* Fallback */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-navy-900 mb-2">Page Not Found</h2>
              <p className="text-navy-500 mb-4">The page you are looking for doesn't exist.</p>
              <a href="/" className="text-accent-600 font-semibold hover:underline">← Go back home</a>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
}

export default App;
