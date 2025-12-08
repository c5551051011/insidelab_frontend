import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Homepage from './pages/Homepage';
import SignInPage from './pages/SignInPage';
import SignupPage from './pages/SignupPage';
import SearchPage from './pages/SearchPage';
import WriteReviewPage from './pages/WriteReviewPage';
import MyProfilePage from './pages/MyProfilePage';
import LabDetailPage from './pages/LabDetailPage';
import MockInterviewBookingPage from './pages/MockInterviewBookingPage';
import MySessionsPage from './pages/MySessionsPage';
import NewsPage from './pages/NewsPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import i18n from './i18n';
import { ToastProvider } from './contexts/ToastContext';

const LanguageRoute = ({ children, lang }) => {
  const location = useLocation();

  useEffect(() => {
    const nextLang = lang || 'en';
    if (i18n.language !== nextLang) {
      i18n.changeLanguage(nextLang);
    }
  }, [lang, location.pathname]);

  return children;
};

const App = () => (
  <Router>
    <ToastProvider>
      <div className="App">
        <Routes>
          {/* English defaults */}
          <Route path="/" element={<LanguageRoute lang="en"><Homepage /></LanguageRoute>} />
          <Route path="/sign-in" element={<LanguageRoute lang="en"><SignInPage /></LanguageRoute>} />
          <Route path="/signup" element={<LanguageRoute lang="en"><SignupPage /></LanguageRoute>} />
          <Route path="/search" element={<LanguageRoute lang="en"><SearchPage /></LanguageRoute>} />
          <Route path="/write-review" element={<LanguageRoute lang="en"><WriteReviewPage /></LanguageRoute>} />
          <Route path="/profile" element={<LanguageRoute lang="en"><MyProfilePage /></LanguageRoute>} />
          <Route path="/lab/:id" element={<LanguageRoute lang="en"><LabDetailPage /></LanguageRoute>} />
          <Route path="/services/mock-interview" element={<LanguageRoute lang="en"><MockInterviewBookingPage /></LanguageRoute>} />
          <Route path="/my-sessions" element={<LanguageRoute lang="en"><MySessionsPage /></LanguageRoute>} />
          <Route path="/news" element={<LanguageRoute lang="en"><NewsPage /></LanguageRoute>} />
          <Route path="/terms" element={<LanguageRoute lang="en"><TermsOfServicePage /></LanguageRoute>} />
          <Route path="/privacy" element={<LanguageRoute lang="en"><PrivacyPolicyPage /></LanguageRoute>} />

          {/* Korean routes */}
          <Route path="/kr" element={<LanguageRoute lang="ko"><Homepage /></LanguageRoute>} />
          <Route path="/kr/sign-in" element={<LanguageRoute lang="ko"><SignInPage /></LanguageRoute>} />
          <Route path="/kr/signup" element={<LanguageRoute lang="ko"><SignupPage /></LanguageRoute>} />
          <Route path="/kr/search" element={<LanguageRoute lang="ko"><SearchPage /></LanguageRoute>} />
          <Route path="/kr/write-review" element={<LanguageRoute lang="ko"><WriteReviewPage /></LanguageRoute>} />
          <Route path="/kr/profile" element={<LanguageRoute lang="ko"><MyProfilePage /></LanguageRoute>} />
          <Route path="/kr/lab/:id" element={<LanguageRoute lang="ko"><LabDetailPage /></LanguageRoute>} />
          <Route path="/kr/services/mock-interview" element={<LanguageRoute lang="ko"><MockInterviewBookingPage /></LanguageRoute>} />
          <Route path="/kr/my-sessions" element={<LanguageRoute lang="ko"><MySessionsPage /></LanguageRoute>} />
          <Route path="/kr/news" element={<LanguageRoute lang="ko"><NewsPage /></LanguageRoute>} />
          <Route path="/kr/terms" element={<LanguageRoute lang="ko"><TermsOfServicePage /></LanguageRoute>} />
          <Route path="/kr/privacy" element={<LanguageRoute lang="ko"><PrivacyPolicyPage /></LanguageRoute>} />
        </Routes>
      </div>
    </ToastProvider>
  </Router>
);

export default App;
