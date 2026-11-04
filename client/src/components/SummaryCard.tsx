interface SummaryCardProps {
  label: string
  value: string | number
  accent?: 'primary' | 'error' | 'neutral'
}

function SummaryCard({ label, value, accent = 'neutral' }: SummaryCardProps) {
  return (
    <div className={`summary-card summary-card--${accent}`}>
      <span className="summary-card-value">{value}</span>
      <span className="summary-card-label">{label}</span>
    </div>
  )
}

export { SummaryCard }
