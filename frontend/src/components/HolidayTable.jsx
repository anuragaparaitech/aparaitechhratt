import React, { useState } from 'react'

function HolidayTable({ holidays, onEditClick, onDeleteClick, isAdmin }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('')

  // Generate Year options dynamically based on holiday dates
  const years = Array.from(
    new Set(holidays.map(h => h.holidayDate.split('-')[0]))
  ).sort((a, b) => b - a)

  // Filter holidays
  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.holidayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (holiday.description && holiday.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const [year, month] = holiday.holidayDate.split('-')
    const matchesYear = filterYear === '' || year === filterYear
    const matchesMonth = filterMonth === '' || month === filterMonth.padStart(2, '0')

    return matchesSearch && matchesYear && matchesMonth
  })

  return (
    <div className="section-card">
      <div className="section-header" style={{ marginBottom: '1.2rem' }}>
        <h2><i className="fas fa-list-ul" style={{ marginRight: '8px' }}></i> Holiday Records List</h2>
        
        <div className="filter-bar">
          <input 
            type="text" 
            className="filter-input" 
            placeholder="🔍 Search holidays..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: '180px', padding: '8px 12px', fontSize: '0.8rem' }}
          />
          <select 
            className="filter-input"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          >
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select 
            className="filter-input"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>HOLIDAY NAME</th>
              <th>DATE</th>
              <th>TYPE</th>
              <th>PAID</th>
              <th>APPLIES TO</th>
              <th>BRANCH</th>
              {isAdmin && <th>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {filteredHolidays.length > 0 ? (
              filteredHolidays.map(holiday => {
                let badgeClass = 'status-half'
                if (holiday.holidayType === 'National Holiday') badgeClass = 'status-full'
                if (holiday.holidayType === 'Festival Holiday') badgeClass = 'status-quarter'
                if (holiday.holidayType === 'Optional Holiday') badgeClass = 'status-pending'

                return (
                  <tr key={holiday._id}>
                    <td>
                      <strong>{holiday.holidayName}</strong>
                      {holiday.description && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px', fontWeight: 'normal' }}>
                          {holiday.description}
                        </div>
                      )}
                    </td>
                    <td>{holiday.holidayDate}</td>
                    <td>
                      <span className={`status-badge ${badgeClass}`}>
                        {holiday.holidayType}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: holiday.isPaidHoliday === 'Yes' ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
                        {holiday.isPaidHoliday === 'Yes' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td>{holiday.appliesTo}</td>
                    <td>{holiday.branch}</td>
                    {isAdmin && (
                      <td>
                        <button 
                          onClick={() => onEditClick(holiday)} 
                          style={{ background: 'none', border: 'none', color: '#1e5a7a', cursor: 'pointer', marginRight: '10px' }}
                          title="Edit Holiday"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => onDeleteClick(holiday._id)} 
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                          title="Delete Holiday"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                  No holidays matched search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HolidayTable
