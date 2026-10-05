import { NavLink, Navigate, Route, Routes } from 'react-router'
import DashboardPage from './pages/DashboardPage.tsx'
import ReportIssuePage from './pages/ReportIssuePage.tsx'

function App() {
  return (
    <>
      <header className="site-header">
        <nav>
          <span className="site-title">EUC Patching App</span>
          <NavLink to="/report">Report an issue</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/report" replace />} />
          <Route path="/report" element={<ReportIssuePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  )
}

export default App
