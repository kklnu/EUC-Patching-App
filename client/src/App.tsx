import { Link, NavLink, Navigate, Route, Routes } from 'react-router'
import DashboardPage from './pages/DashboardPage.tsx'
import ReportIssuePage from './pages/ReportIssuePage.tsx'

function App() {
  return (
    <>
      <header className="site-header">
        <nav>
          <Link to="/" className="site-brand">
            <span className="brand-wordmark">nexteer</span>
            <span className="app-name">EUC Patching</span>
          </Link>
          <NavLink to="/report" className="nav-link">
            Report an issue
          </NavLink>
          <NavLink to="/dashboard" className="nav-link">
            Dashboard
          </NavLink>
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
