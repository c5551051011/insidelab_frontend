import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import SignInPage from './pages/SignInPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SearchPage from './pages/SearchPage';
import WriteReviewPage from './pages/WriteReviewPage';
import MyProfilePage from './pages/MyProfilePage';
import LabDetailPage from './pages/LabDetailPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/write-review" element={<WriteReviewPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/lab/:name" element={<LabDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;