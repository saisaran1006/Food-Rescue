import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Impact from './pages/Impact';
import Login from './pages/Login';
import Register from './pages/Register';
import DonationDetails from './pages/DonationDetails';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Notifications from './pages/Notifications';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import PostDonation from './pages/donor/PostDonation';
import MyDonations from './pages/donor/MyDonations';

// NGO Pages
import NGODashboard from './pages/ngo/NGODashboard';
import FindDonations from './pages/ngo/FindDonations';
import RecommendedDonations from './pages/ngo/RecommendedDonations';
import MyClaims from './pages/ngo/MyClaims';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserVerification from './pages/admin/UserVerification';
import DonationMonitoring from './pages/admin/DonationMonitoring';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/donations/:id" element={<DonationDetails />} />

              {/* Authenticated User Utility Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              {/* Donor Routes */}
              <Route
                path="/donor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/post"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <PostDonation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/my-donations"
                element={
                  <ProtectedRoute allowedRoles={['DONOR', 'ADMIN']}>
                    <MyDonations />
                  </ProtectedRoute>
                }
              />

              {/* NGO Routes */}
              <Route
                path="/ngo/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                    <NGODashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/find"
                element={
                  <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                    <FindDonations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/recommended"
                element={
                  <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                    <RecommendedDonations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/claims"
                element={
                  <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
                    <MyClaims />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserVerification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/donations"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DonationMonitoring />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
