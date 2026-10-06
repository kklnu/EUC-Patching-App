import { getIssueReports } from '../services/issueStorage.ts'

function DashboardPage() {
  const reportCount = getIssueReports().length

  return (
    <>
      <h1>Dashboard</h1>
      <p>The dashboard hasn't been designed yet.</p>
      <p>
        Reports saved in this browser: <strong>{reportCount}</strong>
      </p>
    </>
  )
}

export default DashboardPage
