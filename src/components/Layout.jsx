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
  Bell,
  Settings,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { requestNotificationPermission, saveFcmTokenToSupabase, onForegroundMessage } from '../lib/firebase'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', mobileLabel: 'Home' },
  { path: '/requests', icon: ShoppingBag, label: 'Requests', mobileLabel: 'Requests', badge: true },
  { path: '/price-engine', icon: DollarSign, label: 'Price Engine', mobileLabel: 'Pricing' },
  { path: '/condition-deductions', icon: Sliders, label: 'Conditions', mobileLabel: 'Conditions' },
  { path: '/fraud-alerts', icon: AlertTriangle, label: 'Fraud Alerts', mobileLabel: 'Alerts', alertBadge: true },
  { path: '/agents', icon: Users, label: 'Agent Mgmt', mobileLabel: 'Agents' },
  { path: '/cashify-prices', icon: TrendingUp, label: 'Cashify Prices', mobileLabel: 'Market' },
]

export default function Layout() {
  const { admin, logout, requests, fraudAlerts, subscribeToRealtime, unsubscribeFromRealtime } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    subscribeToRealtime()
    return () => unsubscribeFromRealtime()
  }, [])

  // Setup FCM push notifications
  useEffect(() => {
    async function setupNotifications() {
      try {
        const token = await requestNotificationPermission();
        if (token) {
          await saveFcmTokenToSupabase(token);
        }
      } catch (err) {
        console.error('Notification setup failed:', err);
      }
    }
    setupNotifications();

    onForegroundMessage((payload) => {
      console.log('🔔 Admin received foreground notification:', payload);
    });
  }, [])

  const handleLogout = async () => {
    unsubscribeFromRealtime()
    await logout()
    navigate('/login')
  }

  const pendingCount = requests?.filter(r => r.status === 'Pending').length || 0
  const alertCount = fraudAlerts?.filter(a => !a.resolved).length || 0

  const SidebarContent = ({ onNavClick }) => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-sm font-extrabold text-white tracking-tight">BuyBack Elite</span>
          <p className="text-[10px] text-white/40 -mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
          const badgeNum = item.badge ? pendingCount : item.alertBadge ? alertCount : 0
          return (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-[13px] group
                ${isActive 
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'}
              `}
              onClick={onNavClick}>
              <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-emerald-400' : 'text-white/40 group-hover:text-white/60'}`} />
              <span className="flex-1">{item.label}</span>
              {badgeNum > 0 && (
                <span className={`min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full text-[10px] font-bold ${
                  item.alertBadge ? 'bg-red-500 text-white' : 'bg-emerald-500/30 text-emerald-300'
                }`}>
                  {badgeNum}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 pb-4 mt-auto">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-sm">{admin?.name?.[0] || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">{admin?.name || 'Admin'}</p>
              <p className="text-[10px] text-white/30 truncate">{admin?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full mt-2.5 px-2 py-1.5 text-[11px] text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium">
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile slide-in sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-[260px] admin-sidebar flex flex-col
        transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-end px-3 pt-3">
          <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>
        <SidebarContent onNavClick={() => setSidebarOpen(false)} />
      </aside>

      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:top-0 lg:left-0 lg:z-40 lg:h-full lg:w-[240px] admin-sidebar flex-col">
        <SidebarContent onNavClick={() => {}} />
      </aside>

      {/* Main content */}
      <div className="lg:ml-[240px] pb-16 lg:pb-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-xl border-b border-gray-100/60 flex items-center px-4 lg:px-6">
          {/* Mobile hamburger */}
          <button className="p-2 hover:bg-gray-100/80 rounded-xl mr-3 transition-colors lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-500" />
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg gradient-admin flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-sm text-gradient">Admin</span>
          </div>

          {/* Desktop: page title area */}
          <div className="hidden lg:block">
            <p className="text-sm text-gray-400">Welcome back, <span className="font-semibold text-gray-700">{admin?.name || 'Admin'}</span></p>
          </div>

          <div className="flex-1" />

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/notifications')} className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell className="w-[18px] h-[18px] text-gray-400" />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-xs">{admin?.name?.[0] || 'A'}</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{admin?.name || 'Admin'}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-100 lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-[56px] px-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
            const badgeNum = item.badge ? pendingCount : item.alertBadge ? alertCount : 0
            return (
              <NavLink key={item.path} to={item.path}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative">
                {isActive && <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-600 rounded-full" />}
                <div className="relative">
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                  {badgeNum > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] flex items-center justify-center px-0.5 rounded-full text-[8px] font-bold bg-red-500 text-white">
                      {badgeNum}
                    </span>
                  )}
                </div>
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
