import { useEffect, useMemo, useState } from 'react'
import { getIssueReports } from '../services/issueStorage.ts'
import { groupBy, BreakdownChart } from '../components/BreakdownChart.tsx'
import { TimelineChart } from '../components/TimelineChart.tsx'
import { SummaryCard } from '../components/SummaryCard.tsx'
import type { IssueReport } from '../types/issue.ts'

type ServiceFilter = 'all' | string
type ErrorFilter = 'all' | 'with-error' | 'no-error'
type SortField = 'submittedAt' | 'userName' | 'affectedService' | 'affectedSoftware'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function DashboardPage() {
  const [reports, setReports] = useState<IssueReport[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Filters
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all')
  const [errorFilter, setErrorFilter] = useState<ErrorFilter>('all')
  const [searchText, setSearchText] = useState('')

  // Table sort
  const [sortField, setSortField] = useState<SortField>('submittedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getIssueReports()
        if (!cancelled) {
          setReports(data)
          setLoadError('')
        }
      } catch {
        if (!cancelled) {
          setLoadError('Could not load reports. Please try again later.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Unique services for the filter dropdown
  const allServices = useMemo(
    () =>
      Array.from(new Set(reports.map((r) => r.affectedService))).sort(),
    [reports],
  )

  // Apply filters
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (serviceFilter !== 'all' && r.affectedService !== serviceFilter)
        return false
      if (errorFilter === 'with-error' && !r.errorReceived) return false
      if (errorFilter === 'no-error' && r.errorReceived) return false
      if (searchText.trim()) {
        const q = searchText.toLowerCase()
        const haystack = [
          r.userName,
          r.userEmail,
          r.pcName,
          r.affectedService,
          r.affectedSoftware,
          r.specificIssue,
          r.errorMessage ?? '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [reports, serviceFilter, errorFilter, searchText])

  // Sort table
  const sortedReports = useMemo(() => {
    const sorted = [...filteredReports]
    sorted.sort((a, b) => {
      let cmp: number
      if (sortField === 'submittedAt') {
        cmp = a.submittedAt.localeCompare(b.submittedAt)
      } else {
        cmp = a[sortField].localeCompare(b[sortField])
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [filteredReports, sortField, sortDir])

  // Summary stats (based on ALL reports, not filtered)
  const totalReports = reports.length
  const errorCount = reports.filter((r) => r.errorReceived).length
  const uniqueServices = allServices.length
  const uniqueSoftware = new Set(reports.map((r) => r.affectedSoftware)).size

  // Breakdowns (based on ALL reports)
  const serviceBreakdown = groupBy(reports, 'affectedService')
  const softwareBreakdown = groupBy(reports, 'affectedSoftware')

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function sortIndicator(field: SortField): string {
    if (sortField !== field) return ''
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC'
  }

  function clearFilters() {
    setServiceFilter('all')
    setErrorFilter('all')
    setSearchText('')
  }

  const hasActiveFilters =
    serviceFilter !== 'all' || errorFilter !== 'all' || searchText.trim() !== ''

  if (loading) {
    return (
      <>
        <h1>Dashboard</h1>
        <p>Loading reports...</p>
      </>
    )
  }

  if (loadError) {
    return (
      <>
        <h1>Dashboard</h1>
        <p className="field-error" role="alert">
          {loadError}
        </p>
      </>
    )
  }

  if (totalReports === 0) {
    return (
      <>
        <h1>Dashboard</h1>
        <p>No reports have been submitted yet.</p>
      </>
    )
  }

  return (
    <>
      <h1>Dashboard</h1>

      {/* Summary cards */}
      <div className="summary-cards">
        <SummaryCard label="Total reports" value={totalReports} accent="primary" />
        <SummaryCard label="With errors" value={errorCount} accent="error" />
        <SummaryCard label="Unique services" value={uniqueServices} />
        <SummaryCard label="Unique software" value={uniqueSoftware} />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <TimelineChart reports={reports} />
        <BreakdownChart
          title="Breakdown by service"
          entries={serviceBreakdown}
          total={totalReports}
        />
        <BreakdownChart
          title="Breakdown by software"
          entries={softwareBreakdown}
          total={totalReports}
        />
      </div>

      {/* Reports table */}
      <div className="reports-table-section">
        <div className="reports-table-header">
          <h2>Reports</h2>
          <span className="field-hint">
            Showing {filteredReports.length} of {totalReports}
          </span>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="form-field">
            <label htmlFor="serviceFilter">Service</label>
            <select
              id="serviceFilter"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="all">All services</option>
              {allServices.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="errorFilter">Error</label>
            <select
              id="errorFilter"
              value={errorFilter}
              onChange={(e) => setErrorFilter(e.target.value as ErrorFilter)}
            >
              <option value="all">All reports</option>
              <option value="with-error">With error</option>
              <option value="no-error">No error</option>
            </select>
          </div>

          <div className="form-field filter-search">
            <label htmlFor="searchText">Search</label>
            <input
              id="searchText"
              type="text"
              placeholder="Name, PC, issue, error..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="button-secondary filter-clear"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        {sortedReports.length === 0 ? (
          <p className="chart-empty">No reports match your filters.</p>
        ) : (
          <div className="table-scroll">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort('submittedAt')}
                    >
                      Date{sortIndicator('submittedAt')}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort('userName')}
                    >
                      Reporter{sortIndicator('userName')}
                    </button>
                  </th>
                  <th>PC</th>
                  <th>
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort('affectedService')}
                    >
                      Service{sortIndicator('affectedService')}
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="th-sort"
                      onClick={() => toggleSort('affectedSoftware')}
                    >
                      Software{sortIndicator('affectedSoftware')}
                    </button>
                  </th>
                  <th>Issue</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {sortedReports.map((r) => (
                  <tr key={r.id}>
                    <td className="cell-date">{formatDate(r.submittedAt)}</td>
                    <td className="cell-reporter">
                      <span className="reporter-name">{r.userName}</span>
                      <span className="reporter-email">{r.userEmail}</span>
                    </td>
                    <td className="cell-pc">{r.pcName}</td>
                    <td className="cell-service">{r.affectedService}</td>
                    <td className="cell-software">{r.affectedSoftware}</td>
                    <td className="cell-issue">
                      <span className="issue-text">{r.specificIssue}</span>
                      {r.errorMessage && (
                        <span className="issue-error">{r.errorMessage}</span>
                      )}
                    </td>
                    <td className="cell-error">
                      {r.errorReceived ? (
                        <span className="error-badge">Yes</span>
                      ) : (
                        <span className="no-error-badge">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default DashboardPage
