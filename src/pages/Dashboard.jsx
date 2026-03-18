import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Laptop,
  Tablet,
  Users
} from 'lucide-react'

export default function Dashboard() {
  const { stats, requests, fraudAlerts, fetchStats, fetchRequests, fetchFraudAlerts, isLoading, selectRequest } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
    fetchRequests()
    fetchFraudAlerts()
  }, [])

  const recentRequests = requests.slice(0, 6)

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Overview of your buyback platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard icon={ShoppingBag} label="Total Requests" value={stats.totalRequests} color="blue" />
        <StatCard icon={Clock} label="Pending" value={stats.pendingRequests} color="amber" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completedRequests} color="emerald" />
        <StatCard icon={DollarSign} label="Total Value" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} color="violet" />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent Requests - takes 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm">Recent Requests</h2>
            <button onClick={() => navigate('/requests')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentRequests.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No requests yet</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Device</th>
                      <th className="text-left px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                      <th className="text-right px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="text-right px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentRequests.map((request) => (
                      <tr key={request.id}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => { selectRequest(request); navigate('/requests') }}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              request.device_type === 'MacBook' ? 'bg-indigo-50' : 'bg-emerald-50'
                            }`}>
                              {request.device_type === 'MacBook' 
                                ? <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                                : <Tablet className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                            <span className="font-semibold text-gray-900 text-sm truncate">{request.model_name || request.device_type}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500">{request.users?.name || request.users?.phone || 'Unknown'}</td>
                        <td className="px-5 py-3 text-right font-bold text-sm text-gray-900">₹{(request.system_estimated_price || 0).toLocaleString()}</td>
                        <td className="px-5 py-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            request.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                            request.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              request.status === 'Pending' ? 'bg-amber-500' :
                              request.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`} />
                            {request.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile list */}
              <div className="sm:hidden divide-y divide-gray-50">
                {recentRequests.map((request) => (
                  <div key={request.id}
                    className="px-4 py-3 hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => { selectRequest(request); navigate('/requests') }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{request.model_name || request.device_type}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{request.users?.name || 'Unknown'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-900 text-sm">₹{(request.system_estimated_price || 0).toLocaleString()}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          request.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                          request.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {request.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Fraud Alerts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Fraud Alerts
            </h2>
            <button onClick={() => navigate('/fraud-alerts')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {fraudAlerts.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No active alerts</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {fraudAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="px-5 py-3 hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{alert.alert_message}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{new Date(alert.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
  }
  const c = colors[color] || colors.blue

  return (
    <div className={`bg-white rounded-xl border ${c.border} p-4 card-hover shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <p className="text-lg lg:text-xl font-extrabold text-gray-900">{value}</p>
          <p className="text-[11px] text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  )
}
