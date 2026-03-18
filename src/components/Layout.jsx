import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  DollarSign, 
  Sliders,
  AlertTriangle,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', mobileLabel: 'Home' },
  { path: '/requests', icon: ShoppingBag, label: 'Sell Requests', mobileLabel: 'Requests' },
  { path: '/price-engine', icon: DollarSign, label: 'Price Engine', mobileLabel: 'Pricing' },
  { path: '/condition-deductions', icon: Sliders, label: 'Conditions', mobileLabel: 'Conditions' },
  { path: '/fraud-alerts', icon: AlertTriangle, label: 'Fraud Alerts', mobileLabel: 'Alerts' },
  { path: '/agents', icon: Users, label: 'Agent Management', mobileLabel: 'Agents' },
]

export default function Layout() {
  const { admin, logout, subscribeToRealtime, unsubscribeFromRealtime } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    subscribeToRealtime()
    return () => unsubscribeFromRealtime()
  }, [])

  const handleLogout = async () => {
    unsubscribeFromRealtime()
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-[260px] bg-white shadow-2xl shadow-gray-300/30
        transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-admin flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-extrabold text-gradient">Admin Panel</span>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <nav className="p-2.5 space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm
                ${isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
              `}
              onClick={() => setSidebarOpen(false)}>
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 mb-2.5 px-1">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-sm">{admin?.name?.[0] || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{admin?.name || 'Admin'}</p>
              <p className="text-[11px] text-gray-400 truncate">{admin?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </aside>

      <div className="pb-16 lg:pb-0">
        <header className="sticky top-0 z-30 h-14 glass border-b border-gray-100/50 flex items-center px-4">
          <button className="p-2 hover:bg-gray-100/80 rounded-xl mr-3 transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-admin flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-sm text-gradient">Admin Panel</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-xs">{admin?.name?.[0] || 'A'}</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{admin?.name || 'Admin'}</span>
          </div>
        </header>

        <main className="p-3 lg:p-5 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-100 lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-[56px] px-2">
          {navItems.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
            return (
              <NavLink key={item.path} to={item.path}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative">
                {isActive && <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-600 rounded-full" />}
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className={`text-[10px] leading-tight transition-colors ${isActive ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                  {item.mobileLabel}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
