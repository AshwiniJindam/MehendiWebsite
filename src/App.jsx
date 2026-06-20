import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { legacyStyle } from './lib/legacyHtml.js';
import { useLegacyBridge } from './hooks/useLegacyBridge.js';
import Lightbox from './components/overlays/Lightbox.jsx';
import Navbar from './components/layout/Navbar.jsx';
import HomePage from './components/pages/HomePage.jsx';
import AdmissionPage from './components/pages/AdmissionPage.jsx';
import AdminLogin from './components/pages/AdminLogin.jsx';
import AdminDashboard from './components/pages/AdminDashboard.jsx';
import StudentModal from './components/overlays/StudentModal.jsx';

export default function App() {
  const location = useLocation();
  const pendingSectionRef = useRef(null);
  const isAdminRoute = location.pathname === '/admin' || location.pathname === '/admin-login';
  const adminLogged = typeof window !== 'undefined' && sessionStorage.getItem('admin-logged') === '1';

  useEffect(() => {
    if (!document.getElementById('legacy-site-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'legacy-site-styles';
      styleTag.textContent = legacyStyle;
      document.head.appendChild(styleTag);
    }
  }, []);

  useLegacyBridge(pendingSectionRef);

  return (
    <>
      <Lightbox />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admission" element={<AdmissionPage />} />
        <Route
          path="/admin-login"
          element={adminLogged ? <Navigate to="/admin" replace /> : <AdminLogin />}
        />
        <Route
          path="/admin"
          element={adminLogged ? <AdminDashboard /> : <Navigate to="/admin-login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <StudentModal />
    </>
  );
}
