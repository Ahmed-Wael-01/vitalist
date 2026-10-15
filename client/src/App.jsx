import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Simulation from './pages/Simulation.jsx';
import Scorecard from './pages/Scorecard.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ScenarioEditor from './pages/admin/ScenarioEditor.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="sessions/:id" element={<Simulation />} />
        <Route path="sessions/:id/scorecard" element={<Scorecard />} />
        <Route path="admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/scenarios/new" element={<ProtectedRoute role="admin"><ScenarioEditor /></ProtectedRoute>} />
        <Route path="admin/scenarios/:id" element={<ProtectedRoute role="admin"><ScenarioEditor /></ProtectedRoute>} />
      </Route>
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
