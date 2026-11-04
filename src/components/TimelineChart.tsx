import type { IssueReport } from '../types/issue.ts'

// Groups reports by date (YYYY-MM-DD) and returns entries sorted chronologically
interface TimeEntry {
  date: string
  label: string
  count: number
}

function groupByDate(reports: IssueReport[]): TimeEntry[] {
  const counts = new Map<string, number>()
  for (const report of reports) {
    const date = report.submittedAt.slice(0, 10)
    counts.set(date, (counts.get(date) ?? 0) + 1)
  }
  const entries = Array.from(counts.entries())
    .map(([date, count]) => ({
      date,
      label: new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
  return entries
}

interface TimelineChartProps {
  reports: IssueReport[]
}

// Simple vertical bar chart showing reports per day
function TimelineChart({ reports }: TimelineChartProps) {
  const entries = groupByDate(reports)
  const maxCount = entries.length > 0 ? Math.max(...entries.map((e) => e.count)) : 0

  return (
    <div className="timeline-chart">
      <h2>Reports over time</h2>
      {entries.length === 0 ? (
        <p className="chart-empty">No data to display.</p>
      ) : (
        <div className="timeline-bars">
          {entries.map((entry) => (
            <div key={entry.date} className="timeline-bar-group">
              <span className="timeline-bar-count">{entry.count}</span>
              <div className="timeline-bar-track">
                <div
                  className="timeline-bar-fill"
                  style={{
                    height: `${(entry.count / maxCount) * 100}%`,
                  }}
                />
              </div>
              <span className="timeline-bar-label">{entry.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { TimelineChart }
