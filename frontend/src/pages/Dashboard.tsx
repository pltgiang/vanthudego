import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming')
  const [unit, setUnit] = useState('all')
  const [dept, setDept] = useState('all')
  const [time, setTime] = useState('today')

  const [data, setData] = useState<any>(null)

  useEffect(() => {
    // Gọi API thật khi backend đã sẵn sàng:
    // api.get(`/api/dashboard/documents?type=${tab}&unit=${unit}&dept=${dept}&time=${time}`).then(res => setData(res.data.data)).catch(() => {})
    
    // Tạm thời dùng mock data cho Dashboard để có giao diện đẹp như mẫu
    const mockData = {
      widgets: {
        total: 125,
        pending: 12,
        processing: 45,
        completed: 68
      },
      eisenhower: {
        q1: 15,  // Quan trọng & Khẩn cấp
        q2: 40, // Quan trọng & Không khẩn
        q3: 20,  // Không quan trọng & Khẩn cấp
        q4: 50 // Không quan trọng & Không khẩn
      },
      status_chart: [
        { name: 'Chưa xử lý', value: 12, color: '#ef4444' },
        { name: 'Đang xử lý', value: 45, color: '#d97706' },
        { name: 'Đã xử lý', value: 68, color: '#22c55e' }
      ]
    }
    setData(mockData)
  }, [tab, unit, dept, time])

  if (!data) return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>

  const navigateToList = (statusFilter?: string) => {
    const route = tab === 'incoming' ? '/incoming-documents' : '/outgoing-documents'
    const q = statusFilter ? `?status=${statusFilter}` : ''
    navigate(route + q)
  }

  return (
    <div className="dms-dashboard">
      <div className="dms-dashboard-header">
        <div className="dms-tabs">
          <button className={`dms-tab ${tab === 'incoming' ? 'active' : ''}`} onClick={() => setTab('incoming')}>Văn bản đến</button>
          <button className={`dms-tab ${tab === 'outgoing' ? 'active' : ''}`} onClick={() => setTab('outgoing')}>Văn bản đi</button>
        </div>
        <div className="dms-filters">
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, paddingLeft: 8 }}>
            <i className="ti ti-building" style={{ color: '#94a3b8' }} />
            <select className="dms-filter-select" style={{ border: 'none' }} value={unit} onChange={e => setUnit(e.target.value)}>
              <option value="all">Toàn đơn vị</option>
              <option value="unit1">Công ty Nét Việt</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, paddingLeft: 8 }}>
            <i className="ti ti-list" style={{ color: '#94a3b8' }} />
            <select className="dms-filter-select" style={{ border: 'none' }} value={dept} onChange={e => setDept(e.target.value)}>
              <option value="all">Tất cả phòng ban</option>
              <option value="dept1">Phòng Hành chính</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, paddingLeft: 8 }}>
            <i className="ti ti-calendar" style={{ color: '#94a3b8' }} />
            <select className="dms-filter-select" style={{ border: 'none' }} value={time} onChange={e => setTime(e.target.value)}>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>
          </div>
        </div>
      </div>

      <div className="dms-widgets-grid">
        <div className="dms-widget" onClick={() => navigateToList()}>
          <div className="dms-widget-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <i className="ti ti-layout-grid" />
          </div>
          <div className="dms-widget-content">
            <div className="dms-widget-title">Tổng số văn bản</div>
            <div className="dms-widget-value" style={{ color: '#0284c7' }}>{data.widgets.total}</div>
          </div>
        </div>
        <div className="dms-widget" onClick={() => navigateToList('pending')}>
          <div className="dms-widget-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <i className="ti ti-circle-minus" />
          </div>
          <div className="dms-widget-content">
            <div className="dms-widget-title">Chưa xử lý</div>
            <div className="dms-widget-value" style={{ color: '#ef4444' }}>{data.widgets.pending}</div>
          </div>
        </div>
        <div className="dms-widget" onClick={() => navigateToList('processing')}>
          <div className="dms-widget-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <i className="ti ti-circle-dot" />
          </div>
          <div className="dms-widget-content">
            <div className="dms-widget-title">Đang xử lý</div>
            <div className="dms-widget-value" style={{ color: '#d97706' }}>{data.widgets.processing}</div>
          </div>
        </div>
        <div className="dms-widget" onClick={() => navigateToList('completed')}>
          <div className="dms-widget-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>
            <i className="ti ti-circle-check" />
          </div>
          <div className="dms-widget-content">
            <div className="dms-widget-title">Đã xử lý</div>
            <div className="dms-widget-value" style={{ color: '#22c55e' }}>{data.widgets.completed}</div>
          </div>
        </div>
      </div>

      <div className="dms-charts-grid">
        <div className="dms-chart-card">
          <div className="dms-chart-title">Thống kê văn bản theo mức độ quan trọng, khẩn cấp</div>
          <div className="heatmap-container" style={{ width: '100%', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed', height: '100%', maxHeight: 300, textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ width: 130 }}></th>
                  <th style={{ width: '50%', fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: 12, textTransform: 'none', textAlign: 'center', fontSize: 14, letterSpacing: 'normal', background: 'transparent' }}>Khẩn cấp</th>
                  <th style={{ width: '50%', fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0', paddingBottom: 12, textTransform: 'none', textAlign: 'center', fontSize: 14, letterSpacing: 'normal', background: '#fafcff' }}>Không khẩn cấp</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ fontWeight: 600, color: '#475569', borderRight: '2px solid #e2e8f0', paddingRight: 12, textAlign: 'right' }}>Quan trọng</th>
                  <td style={{ padding: '8px 4px 4px 8px' }}>
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 110, cursor: 'pointer', transition: 'all 0.2s' }} className="hover-scale">
                      <span style={{ fontSize: 36, fontWeight: 700, color: '#ef4444', lineHeight: 1 }}>{data.eisenhower.q1}</span>
                      <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 500, marginTop: 4 }}>văn bản</span>
                    </div>
                  </td>
                  <td style={{ padding: '8px 8px 4px 4px' }}>
                    <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 110, cursor: 'pointer', transition: 'all 0.2s' }} className="hover-scale">
                      <span style={{ fontSize: 36, fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{data.eisenhower.q2}</span>
                      <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 500, marginTop: 4 }}>văn bản</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th style={{ fontWeight: 600, color: '#475569', borderRight: '2px solid #e2e8f0', paddingRight: 12, textAlign: 'right' }}>Không quan trọng</th>
                  <td style={{ padding: '4px 4px 8px 8px' }}>
                    <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 110, cursor: 'pointer', transition: 'all 0.2s' }} className="hover-scale">
                      <span style={{ fontSize: 36, fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{data.eisenhower.q3}</span>
                      <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 500, marginTop: 4 }}>văn bản</span>
                    </div>
                  </td>
                  <td style={{ padding: '4px 8px 8px 4px' }}>
                    <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 110, cursor: 'pointer', transition: 'all 0.2s' }} className="hover-scale">
                      <span style={{ fontSize: 36, fontWeight: 700, color: '#64748b', lineHeight: 1 }}>{data.eisenhower.q4}</span>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 4 }}>văn bản</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="dms-chart-card">
          <div className="dms-chart-title">Thống kê văn bản theo trạng thái hoàn thành</div>
          <div style={{ width: '100%', height: 320 }}>
            {data.status_chart.reduce((a: number, b: any) => a + b.value, 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.status_chart} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {data.status_chart.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                <i className="ti ti-chart-bar" style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }} />
                <span>Chưa có dữ liệu</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
