import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Detect active tab from URL
  const currentPath = location.pathname;
  const SvgReports = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.6667 3.33333H3.33333C2.41286 3.33333 1.66667 4.07952 1.66667 5V15C1.66667 15.9205 2.41286 16.6667 3.33333 16.6667H16.6667C17.5871 16.6667 18.3333 15.9205 18.3333 15V5C18.3333 4.07952 17.5871 3.33333 16.6667 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.3333 1.66667V5.00001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.66667 1.66667V5.00001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.66667 8.33333H18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.33333 11.6667H11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.33333 15H11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col h-screen`}>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Farahoz Hospital</h1>
                <p className="text-xs text-gray-500">Mogadishu</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        <SidebarItem
          icon={<SvgDashboard />}
          label="Dashboard"
          to="/"
          active={currentPath === '/dashboard'}
          sidebarOpen={sidebarOpen}
        />

        <SidebarItem
          icon={<SvgReceipt />}
          label="Receipt"
          to="/receipt"
          active={currentPath === '/receipt'}
          sidebarOpen={sidebarOpen}
        />

        <SidebarItem
          icon={<SvgPatients />}
          label="View Receipts"
          to="/view-receipt"
          active={currentPath === '/view-receipt'}
          sidebarOpen={sidebarOpen}
        />
        {/* add reports */}
        <SidebarItem
          icon={<SvgReports />}
          label="Reports"
          to="/reports"
          active={currentPath === '/reports'}
          sidebarOpen={sidebarOpen}
        />

      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm font-semibold">AD</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">Farahoz</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ============================
// Sidebar Item
// ============================

function SidebarItem({ icon, label, active, to, sidebarOpen }) {
  return (
    <Link
      to={to}
      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className={active ? 'text-blue-600' : 'text-gray-400'}>
        {icon}
      </div>

      {sidebarOpen && <span className="font-medium text-sm">{label}</span>}
    </Link>
  );
}

// Icons
function SvgDashboard() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function SvgReceipt() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function SvgPatients() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export default Sidebar;
