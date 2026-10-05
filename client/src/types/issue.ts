// The shape of one patch-related issue reported by an employee.
// Both the report form and the dashboard use this type.
export interface IssueReport {
  // Unique ID, assigned when the report is saved
  id: string
  // When the report was submitted, as an ISO 8601 string
  submittedAt: string

  userName: string
  userEmail: string
  pcName: string
  // The list of services hasn't been agreed yet, so this is free text for now
  affectedService: string
  specificIssue: string
  errorReceived: boolean
  // Only filled in when errorReceived is true
  errorDetails?: string
  affectedSoftware: string
}

// What the form collects. The ID and timestamp are added when the report is saved.
export type NewIssueReport = Omit<IssueReport, 'id' | 'submittedAt'>
