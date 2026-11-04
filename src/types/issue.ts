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
  // The exact error text or code. Only filled in when errorReceived is true
  errorMessage?: string
  // Optional description of what happened. Only filled in when errorReceived is true
  errorDetails?: string
  affectedSoftware: string
  attachments: IssueAttachment[]
}

// A screenshot or document attached to a report
export interface IssueAttachment {
  name: string
  // MIME type, for example image/png or application/pdf
  type: string
  // Size in bytes
  size: number
  // The file contents as a data URL. Temporary until the backend stores files.
  dataUrl: string
}

// What the form collects. The ID and timestamp are added when the report is saved.
export type NewIssueReport = Omit<IssueReport, 'id' | 'submittedAt'>
