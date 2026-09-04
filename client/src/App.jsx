import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentCatalog } from './pages/StudentCatalog';
import { StudentHistory } from './pages/StudentHistory';
import { StudentReservations } from './pages/StudentReservations';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminBooks } from './pages/AdminBooks';
import { AdminCirculation } from './pages/AdminCirculation';
import { AdminStudents } from './pages/AdminStudents';
import { AdminAnalytics } from './pages/AdminAnalytics';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Student Portal */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/catalog" element={<StudentCatalog />} />
          <Route path="/history" element={<StudentHistory />} />
          <Route path="/reservations" element={<StudentReservations />} />
        </Route>
      </Route>

      {/* Protected Librarian / Admin Workspace */}
      <Route element={<ProtectedRoute requireAdmin={true} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/admin/circulation" element={<AdminCirculation />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
