import type { IssueReport, NewIssueReport } from '../types/issue.ts'

// Temporary storage: keeps reports in this browser's localStorage until the
// backend exists. Only this file should change when we switch to a real API.
const STORAGE_KEY = 'euc-patching.issueReports'

export function getIssueReports(): IssueReport[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as IssueReport[]) : []
  } catch {
    return []
  }
}

export function saveIssueReport(newReport: NewIssueReport): IssueReport {
  const report: IssueReport = {
    ...newReport,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...getIssueReports(), report]),
  )
  return report
}
