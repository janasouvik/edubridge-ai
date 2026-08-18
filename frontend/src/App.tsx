import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { DashboardHome } from './pages/dashboard/Home';
import { DoubtSolver } from './pages/dashboard/DoubtSolver';
import { Practice } from './pages/dashboard/Practice';
import { Progress } from './pages/dashboard/Progress';
import { StudyMaterials } from './pages/dashboard/StudyMaterials';
import { Scholarships } from './pages/dashboard/Scholarships';
import { TeacherInsights } from './pages/dashboard/TeacherInsights';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="doubt-solver" element={<DoubtSolver />} />
          <Route path="practice" element={<Practice />} />
          <Route path="progress" element={<Progress />} />
          <Route path="study-materials" element={<StudyMaterials />} />
          <Route path="scholarships" element={<Scholarships />} />
          <Route
            path="teacher-insights"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <TeacherInsights />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
