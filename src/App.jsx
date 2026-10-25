import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import SplashScreen from './components/common/SplashScreen';

import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import MyDay from './pages/MyDay';
import CalendarView from './pages/CalendarView';
import Milestones from './pages/Milestones';
import Documents from './pages/Documents';
import Analytics from './pages/Analytics';
import ActivityHistory from './pages/ActivityHistory';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Workspace3D from './pages/Workspace3D';

export default function App() {
  const [openCustomizerTrigger, setOpenCustomizerTrigger] = useState(0);

  const handleOpenCustomizer = () => {
    setOpenCustomizerTrigger((prev) => prev + 1);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <SplashScreen>
          <WorkspaceProvider>
            <BrowserRouter>
              <AuthModalProvider>
                <Routes>
                  {/* Standalone Authentication Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Main Application with AppLayout */}
                  <Route element={<AppLayout onOpenCustomizer={handleOpenCustomizer} />}>
                    <Route path="/" element={<Dashboard key={openCustomizerTrigger} />} />
                    <Route path="/workspace-3d" element={<Workspace3D />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetails />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/my-day" element={<MyDay />} />
                    <Route path="/calendar" element={<CalendarView />} />
                    <Route path="/milestones" element={<Milestones />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/activity" element={<ActivityHistory />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </AuthModalProvider>
            </BrowserRouter>
          </WorkspaceProvider>
        </SplashScreen>
      </AuthProvider>
    </ThemeProvider>
  );
}
