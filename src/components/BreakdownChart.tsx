import type { IssueReport } from '../types/issue.ts'

// One entry in a breakdown: a label and how many reports fall into it
interface BreakdownEntry {
  label: string
  count: number
}

// Groups reports by a field and returns entries sorted by count descending
function groupBy(
  reports: IssueReport[],
  field: keyof IssueReport,
): BreakdownEntry[] {
  const counts = new Map<string, number>()
  for (const report of reports) {
    const value = String(report[field] ?? 'Unknown')
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

interface BreakdownChartProps {
  title: string
  entries: BreakdownEntry[]
  total: number
}

// Horizontal bar chart showing the breakdown of reports by a field
function BreakdownChart({ title, entries, total }: BreakdownChartProps) {
  const maxCount = entries.length > 0 ? entries[0].count : 0

  return (
    <div className="breakdown-chart">
      <h2>{title}</h2>
      {entries.length === 0 ? (
        <p className="chart-empty">No data to display.</p>
      ) : (
        <ul className="bar-list">
          {entries.map((entry) => (
            <li key={entry.label} className="bar-item">
              <span className="bar-label">{entry.label}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(entry.count / maxCount) * 100}%`,
                  }}
                />
              </div>
              <span className="bar-count">{entry.count}</span>
              <span className="bar-percent">
                {Math.round((entry.count / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { type BreakdownEntry, groupBy, BreakdownChart }
