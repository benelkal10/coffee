import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Coffee, ClipboardList, FileBarChart, BarChart3, Sun, Moon, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Home from './pages/Home';
import Order from './pages/Order';
import Reports from './pages/Reports';
import Histogram from './pages/Histogram';
import HistoryPage from './pages/History';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const muiTheme = createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: '#d97706', // var(--accent-primary)
      },
      secondary: {
        main: '#f59e0b',
      },
      background: {
        default: theme === 'dark' ? '#0d0b0a' : '#fbf9f6',
        paper: theme === 'dark' ? '#161210' : '#f3ede2',
      },
      text: {
        primary: theme === 'dark' ? '#f5efe6' : '#3d2f26',
        secondary: theme === 'dark' ? '#a89f91' : '#8c786a',
      },
    },
    typography: {
      fontFamily: "'Outfit', sans-serif",
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <Router>
      <div className="app-container">
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="brand" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <Coffee className="brand-icon" size={32} style={{ flexShrink: 0 }} />
              <div className="brand-text">
                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Virtual Cafe</h1>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Smart Brewing Bar</p>
              </div>
            </div>
            <button 
              onClick={toggleSidebar}
              style={{
                background: 'rgba(217, 119, 6, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.05)'}
              aria-label="Toggle Sidebar"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          
          <nav className="nav-menu">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
              <Coffee size={20} style={{ flexShrink: 0 }} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/order" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ClipboardList size={20} style={{ flexShrink: 0 }} />
              <span>Place Order</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <History size={20} style={{ flexShrink: 0 }} />
              <span>Order History</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileBarChart size={20} style={{ flexShrink: 0 }} />
              <span>Reports</span>
            </NavLink>
            <NavLink to="/histogram" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} style={{ flexShrink: 0 }} />
              <span>Analytics</span>
            </NavLink>
          </nav>

          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} style={{ flexShrink: 0 }} /> : <Moon size={20} style={{ flexShrink: 0 }} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <div className="sidebar-footer">
            <div className="status-badge">
              <span className="pulse-indicator" style={{ flexShrink: 0 }}></span>
              <span className="status-text">System Online</span>
            </div>
          </div>
        </aside>
        
        <main className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/order" element={<Order />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/histogram" element={<Histogram />} />
          </Routes>
        </main>
      </div>
    </Router>
  </ThemeProvider>
  );
}
