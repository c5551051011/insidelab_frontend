import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n';
import Homepage from './pages/Homepage';
import SignInPage from './pages/SignInPage';
import SignupPage from './pages/SignupPage';
import SearchPage from './pages/SearchPage';
import WriteReviewPage from './pages/WriteReviewPage';
import MyProfilePage from './pages/MyProfilePage';
import LabDetailPage from './pages/LabDetailPage';
import MockInterviewBookingPage from './pages/MockInterviewBookingPage';
import MySessionsPage from './pages/MySessionsPage';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/write-review" element={<WriteReviewPage />} />
            <Route path="/profile" element={<MyProfilePage />} />
            <Route path="/lab/:name" element={<LabDetailPage />} />
            <Route path="/services/mock-interview" element={<MockInterviewBookingPage />} />
            <Route path="/my-sessions" element={<MySessionsPage />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;