import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ProjectListPage from './pages/ProjectListPage.jsx';
import NewProjectPage from './pages/NewProjectPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/query-planner" element={<ProjectListPage />} />
        <Route path="/query-planner/new" element={<NewProjectPage />} />
        <Route path="/query-planner/:id/:keywordSlug?" element={<DashboardPage />} />
      </Routes>
    </AppShell>
  );
}
