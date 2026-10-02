import React, { useState, useEffect } from 'react'
import { analyticsAPI } from '../services/api'

function LeaderboardView({ currentUser, showToast }) {
  const [period, setPeriod] = useState('month') // 'today' | 'month' | 'all'
  const [activeCategory, setActiveCategory] = useState('conversions') // 'conversions' | 'calls' | 'mailBlasts' | 'teams'
  const [loading, setLoading] = useState(true)
  const [leaderboardData, setLeaderboardData] = useState({
    byConversions: [],
    byCalls: [],
    byMailBlasts: [],
    byTeams: []
  })

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const res = await analyticsAPI.getLeaderboard(period)
      if (res?.success) {
        setLeaderboardData(res.data)
      }
    } catch (err) {
      console.error('Leaderboard error:', err)
      showToast('❌ Failed to load leaderboard', '#dc2626')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [period])

  const renderRankBadge = (rank) => {
    if (rank === 1) return <span style={{ background: '#eab308', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.82rem' }}>🥇</span>
    if (rank === 2) return <span style={{ background: '#94a3b8', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.82rem' }}>🥈</span>
    if (rank === 3) return <span style={{ background: '#cd7f32', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.82rem' }}>🥉</span>
    return <span style={{ background: '#f1f5f9', color: '#64748b', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.82rem' }}>{rank}</span>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 50%, #2563eb 100%)',
        borderRadius: '24px',
        padding: '2rem 2.25rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 20px 35px -10px rgba(10, 25, 47, 0.3)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.74rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#fde047'
            }}>
              🏆 Company Honors
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
            Aparaitech Top Performers Leaderboard
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: '#cbd5e1' }}>
            Recognizing excellence across student admissions, candidate calls, outreach campaigns, and team synergy
          </p>
        </div>

        {/* Period Selector Filter */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(8px)',
          padding: '4px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          {[
            { id: 'today', label: 'Today' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              style={{
                background: period === p.id ? '#ffffff' : 'transparent',
                color: period === p.id ? '#0a192f' : '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'conversions', icon: 'fa-award', label: 'By Conversions & Revenue' },
          { id: 'calls', icon: 'fa-phone-alt', label: 'By Connected Calls' },
          { id: 'mailBlasts', icon: 'fa-mail-bulk', label: 'By Mail Blasts' },
          { id: 'teams', icon: 'fa-sitemap', label: 'Team Rankings' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: activeCategory === cat.id ? '#0a192f' : '#ffffff',
              color: activeCategory === cat.id ? '#ffffff' : '#475569',
              fontWeight: '700',
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              border: activeCategory === cat.id ? '1px solid #0a192f' : '1px solid #e2e8f0'
            }}
          >
            <i className={`fas ${cat.icon}`}></i> {cat.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table Container */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.8rem', color: '#2563eb', marginBottom: '10px' }}></i>
            <div>Loading leaderboard rankings...</div>
          </div>
        ) : (
          <>
            {/* 1. By Conversions & Revenue */}
            {activeCategory === 'conversions' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>RANK</th>
                      <th>EMPLOYEE</th>
                      <th>TEAM</th>
                      <th>CONVERSIONS</th>
                      <th>TOTAL REVENUE (₹6,000/CONV)</th>
                      <th>CONNECTED CALLS</th>
                      <th>REPORTS SUBMITTED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.byConversions.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                          No conversion records found for this period.
                        </td>
                      </tr>
                    ) : (
                      leaderboardData.byConversions.map((item, idx) => {
                        const isMe = item._id === currentUser?.email?.toLowerCase()
                        return (
                          <tr key={item._id} style={{ background: isMe ? '#eff6ff' : (idx < 3 ? '#fafaf9' : 'transparent') }}>
                            <td>{renderRankBadge(idx + 1)}</td>
                            <td>
                              <div style={{ fontWeight: '700', color: '#0a192f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {item.name}
                                {isMe && <span style={{ fontSize: '0.68rem', background: '#2563eb', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>You</span>}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.empId}</div>
                            </td>
                            <td>{item.team || 'BDA'}</td>
                            <td>
                              <span style={{
                                background: '#dcfce7',
                                color: '#15803d',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontWeight: '800',
                                fontSize: '0.95rem'
                              }}>
                                {item.totalConversions}
                              </span>
                            </td>
                            <td style={{ color: '#2563eb', fontWeight: '800', fontSize: '1rem' }}>
                              ₹{(item.totalRevenue || 0).toLocaleString('en-IN')}
                            </td>
                            <td><strong>{item.totalCalls || 0}</strong></td>
                            <td>{item.reportsSubmitted || 1} days</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. By Connected Calls */}
            {activeCategory === 'calls' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>RANK</th>
                      <th>EMPLOYEE</th>
                      <th>TEAM</th>
                      <th>TOTAL CONNECTED CALLS</th>
                      <th>CALLS ABOVE 3 MIN</th>
                      <th>CONVERSIONS WON</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.byCalls.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                          No call records found for this period.
                        </td>
                      </tr>
                    ) : (
                      leaderboardData.byCalls.map((item, idx) => {
                        const isMe = item._id === currentUser?.email?.toLowerCase()
                        return (
                          <tr key={item._id} style={{ background: isMe ? '#eff6ff' : (idx < 3 ? '#fafaf9' : 'transparent') }}>
                            <td>{renderRankBadge(idx + 1)}</td>
                            <td>
                              <div style={{ fontWeight: '700', color: '#0a192f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {item.name}
                                {isMe && <span style={{ fontSize: '0.68rem', background: '#2563eb', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>You</span>}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.empId}</div>
                            </td>
                            <td>{item.team || 'BDA'}</td>
                            <td>
                              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0a192f' }}>
                                {item.totalCalls}
                              </span>
                            </td>
                            <td style={{ color: '#0284c7', fontWeight: '700' }}>{item.callsAbove3Min || 0}</td>
                            <td>
                              <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                                {item.totalConversions || 0}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. By Mail Blasts */}
            {activeCategory === 'mailBlasts' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>RANK</th>
                      <th>EMPLOYEE</th>
                      <th>TEAM</th>
                      <th>TOTAL EMAILS SENT</th>
                      <th>RESPONSES RECEIVED</th>
                      <th>CAMPAIGNS COUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.byMailBlasts.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                          No mail blast reports recorded for this period.
                        </td>
                      </tr>
                    ) : (
                      leaderboardData.byMailBlasts.map((item, idx) => {
                        const isMe = item._id === currentUser?.email?.toLowerCase()
                        return (
                          <tr key={item._id} style={{ background: isMe ? '#eff6ff' : (idx < 3 ? '#fafaf9' : 'transparent') }}>
                            <td>{renderRankBadge(idx + 1)}</td>
                            <td>
                              <div style={{ fontWeight: '700', color: '#0a192f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {item.name}
                                {isMe && <span style={{ fontSize: '0.68rem', background: '#2563eb', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>You</span>}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.empId}</div>
                            </td>
                            <td>{item.team || 'BDA'}</td>
                            <td>
                              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0369a1' }}>
                                {item.totalEmailsSent.toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td style={{ color: '#16a34a', fontWeight: '800' }}>{item.totalResponses}</td>
                            <td>{item.campaignsCount} campaigns</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. By Teams */}
            {activeCategory === 'teams' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>RANK</th>
                      <th>TEAM NAME</th>
                      <th>ACTIVE MEMBERS</th>
                      <th>TOTAL CONVERSIONS</th>
                      <th>TEAM REVENUE GENERATED</th>
                      <th>TOTAL CALLS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.byTeams.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                          No team aggregation data available for this period.
                        </td>
                      </tr>
                    ) : (
                      leaderboardData.byTeams.map((item, idx) => (
                        <tr key={item.team || idx}>
                          <td>{renderRankBadge(idx + 1)}</td>
                          <td>
                            <strong style={{ fontSize: '1rem', color: '#0a192f' }}>{item.team || 'BDA'}</strong>
                          </td>
                          <td>{item.memberCount || 1} associates</td>
                          <td>
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '8px', fontWeight: '800' }}>
                              {item.totalConversions}
                            </span>
                          </td>
                          <td style={{ color: '#2563eb', fontWeight: '800', fontSize: '1rem' }}>
                            ₹{(item.totalRevenue || 0).toLocaleString('en-IN')}
                          </td>
                          <td><strong>{item.totalCalls || 0}</strong></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default LeaderboardView
