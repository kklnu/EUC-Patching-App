import { supabase } from './supabaseClient.ts'
import type { IssueReport, IssueAttachment, NewIssueReport } from '../types/issue.ts'

// Database row shape (snake_case from Postgres)
interface IssueReportRow {
  id: string
  submitted_at: string
  user_name: string
  user_email: string
  pc_name: string
  affected_service: string
  specific_issue: string
  error_received: boolean
  error_message: string | null
  error_details: string | null
  affected_software: string
  attachments: IssueAttachment[]
}

function rowToReport(row: IssueReportRow): IssueReport {
  return {
    id: row.id,
    submittedAt: row.submitted_at,
    userName: row.user_name,
    userEmail: row.user_email,
    pcName: row.pc_name,
    affectedService: row.affected_service,
    specificIssue: row.specific_issue,
    errorReceived: row.error_received,
    errorMessage: row.error_message ?? undefined,
    errorDetails: row.error_details ?? undefined,
    affectedSoftware: row.affected_software,
    attachments: row.attachments ?? [],
  }
}

export async function getIssueReports(): Promise<IssueReport[]> {
  const { data, error } = await supabase
    .from('issue_reports')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return (data as IssueReportRow[]).map(rowToReport)
}

export async function saveIssueReport(
  newReport: NewIssueReport,
): Promise<IssueReport> {
  const { data, error } = await supabase
    .from('issue_reports')
    .insert({
      user_name: newReport.userName,
      user_email: newReport.userEmail,
      pc_name: newReport.pcName,
      affected_service: newReport.affectedService,
      specific_issue: newReport.specificIssue,
      error_received: newReport.errorReceived,
      error_message: newReport.errorReceived ? newReport.errorMessage ?? null : null,
      error_details: newReport.errorReceived ? newReport.errorDetails ?? null : null,
      affected_software: newReport.affectedSoftware,
      attachments: newReport.attachments,
    })
    .select('*')
    .single()

  if (error) throw error
  return rowToReport(data as IssueReportRow)
}
