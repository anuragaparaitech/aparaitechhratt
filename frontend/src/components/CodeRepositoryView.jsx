import React, { useState, useEffect } from 'react'
import { repoAPI } from '../services/api'

function CodeRepositoryView({ currentUser, showToast }) {
  const [activeTab, setActiveTab] = useState('commits') // 'commits' | 'pulls' | 'branches' | 'issues'
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [overview, setOverview] = useState(null)
  const [commits, setCommits] = useState([])
  const [pulls, setPulls] = useState([])
  const [branches, setBranches] = useState([])
  const [issues, setIssues] = useState([])
  const [selectedRepo, setSelectedRepo] = useState('anuragaparaitech/aparaitechhratt')

  useEffect(() => {
    loadAllRepoData()
  }, [selectedRepo])

  const loadAllRepoData = async () => {
    setLoading(true)
    try {
      const [ovRes, comRes, pullRes, brRes, issRes] = await Promise.allSettled([
        repoAPI.getOverview(selectedRepo),
        repoAPI.getCommits(selectedRepo),
        repoAPI.getPulls(selectedRepo),
        repoAPI.getBranches(selectedRepo),
        repoAPI.getIssues(selectedRepo)
      ])

      if (ovRes.status === 'fulfilled' && ovRes.value.success) setOverview(ovRes.value.data)
      if (comRes.status === 'fulfilled' && comRes.value.success) setCommits(comRes.value.data || [])
      if (pullRes.status === 'fulfilled' && pullRes.value.success) setPulls(pullRes.value.data || [])
      if (brRes.status === 'fulfilled' && brRes.value.success) setBranches(brRes.value.data || [])
      if (issRes.status === 'fulfilled' && issRes.value.success) setIssues(issRes.value.data || [])
    } catch (err) {
      console.error('Error loading repo data:', err)
      showToast('⚠️ Could not fetch repository updates', '#f59e0b')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await loadAllRepoData()
      showToast('🔄 Repository data synced from GitHub', '#10b981')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* GitHub Repository Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <i className="fab fa-github"></i>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#58a6ff', background: 'rgba(56, 139, 253, 0.15)', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>
                Active Production Repository
              </span>
              <span style={{ fontSize: '0.72rem', color: '#7ee787', background: 'rgba(46, 160, 67, 0.15)', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>
                ● Branch: main
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{selectedRepo}</span>
            </h1>
            <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>
              Aparaitech Software • Cross-Platform Web & Native Android Workspace
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '9px 16px',
              fontWeight: '700',
              fontSize: '0.82rem',
              cursor: syncing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
          >
            <i className={`fas fa-sync-alt ${syncing ? 'fa-spin' : ''}`}></i>
            {syncing ? 'Syncing...' : 'Sync Git'}
          </button>

          <a
            href={`https://github.com/${selectedRepo}`}
            target="_blank"
            rel="noreferrer"
            style={{
              background: '#238636',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '10px',
              padding: '9px 18px',
              fontWeight: '800',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(35, 134, 54, 0.4)'
            }}
          >
            <i className="fas fa-external-link-alt"></i>
            Open on GitHub
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '6px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'commits', label: 'Commits', count: commits.length, icon: 'fa-code-commit' },
          { id: 'pulls', label: 'Pull Requests', count: pulls.length, icon: 'fa-code-pull-request' },
          { id: 'branches', label: 'Branches', count: branches.length, icon: 'fa-code-branch' },
          { id: 'issues', label: 'Issues & Bugs', count: issues.length, icon: 'fa-circle-dot' }
        ].map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '9px 14px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? '#0a192f' : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s'
              }}
            >
              <i className={`fas ${tab.icon}`} style={{ fontSize: '0.85rem' }}></i>
              <span>{tab.label}</span>
              <span style={{
                background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#64748b',
                padding: '2px 7px',
                borderRadius: '999px',
                fontSize: '0.7rem'
              }}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '1.8rem', color: '#2563eb', marginBottom: '10px' }}></i>
            <div>Connecting to code repository...</div>
          </div>
        ) : (
          <>
            {/* 1. COMMITS TAB */}
            {activeTab === 'commits' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '800', fontSize: '0.78rem', color: '#475569' }}>
                  LATEST COMMITS ON BRANCH <span style={{ color: '#0969da' }}>main</span>
                </div>
                {commits.map((c, i) => (
                  <div
                    key={c.sha || i}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '240px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        flexShrink: 0
                      }}>
                        <i className="fas fa-code-commit"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.35, marginBottom: '4px' }}>
                          {c.message}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', color: '#334155' }}>{c.author?.name || 'Developer'}</span>
                          <span>•</span>
                          <span>{new Date(c.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        background: '#f1f5f9',
                        color: '#0969da',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontWeight: '700'
                      }}>
                        {c.sha}
                      </span>
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            fontWeight: '700'
                          }}
                        >
                          View Diff
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. PULL REQUESTS TAB */}
            {activeTab === 'pulls' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '800', fontSize: '0.78rem', color: '#475569' }}>
                  ACTIVE PULL REQUESTS & CODE REVIEWS
                </div>
                {pulls.map((pr) => (
                  <div
                    key={pr.number}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '240px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: pr.status === 'Merged' ? '#8250df' : '#238636',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        flexShrink: 0
                      }}>
                        <i className={`fas ${pr.status === 'Merged' ? 'fa-code-merge' : 'fa-code-pull-request'}`}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.35, marginBottom: '4px' }}>
                          #{pr.number} {pr.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700', color: '#0969da' }}>{pr.sourceBranch}</span>
                          <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem' }}></i>
                          <span style={{ fontWeight: '700', color: '#334155' }}>{pr.targetBranch}</span>
                          <span>•</span>
                          <span>by {pr.author}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        background: pr.status === 'Merged' ? '#f3e8ff' : '#ecfdf5',
                        color: pr.status === 'Merged' ? '#7e22ce' : '#059669',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '800'
                      }}>
                        {pr.status}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        <i className="fas fa-comment" style={{ marginRight: '4px' }}></i> {pr.commentsCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. BRANCHES TAB */}
            {activeTab === 'branches' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '800', fontSize: '0.78rem', color: '#475569' }}>
                  ACTIVE GIT BRANCHES
                </div>
                {branches.map((b) => (
                  <div
                    key={b.name}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className="fas fa-code-branch" style={{ color: '#2563eb' }}></i>
                      <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a', fontFamily: 'monospace' }}>
                        {b.name}
                      </span>
                      {b.isDefault && (
                        <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>
                          default
                        </span>
                      )}
                      {b.protected && (
                        <span style={{ background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>
                          protected
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Last commit: <strong style={{ color: '#0969da' }}>{b.lastCommit}</strong> ({b.updated})
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. ISSUES & BUGS TAB */}
            {activeTab === 'issues' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '800', fontSize: '0.78rem', color: '#475569' }}>
                  OPEN SPRINT BUGS & ENHANCEMENTS
                </div>
                {issues.map((iss) => (
                  <div
                    key={iss.id}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                      <i className="fas fa-exclamation-circle" style={{ color: iss.status === 'open' ? '#1a7f37' : '#8250df', marginTop: '3px' }}></i>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a', marginBottom: '4px' }}>
                          {iss.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          #{iss.id} opened by {iss.author} • Assigned to <strong>{iss.assignedTo}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {iss.labels && iss.labels.map((l, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: l === 'bug' ? '#fef2f2' : (l === 'feature' ? '#eff6ff' : '#f8fafc'),
                            color: l === 'bug' ? '#ef4444' : (l === 'feature' ? '#2563eb' : '#475569'),
                            border: `1px solid ${l === 'bug' ? '#fecaca' : '#bfdbfe'}`,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: '700'
                          }}
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CodeRepositoryView
