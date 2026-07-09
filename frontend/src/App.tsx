import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Coffee, ClipboardList, FileBarChart, BarChart3 } from 'lucide-react';
import Home from './pages/Home';
import Order from './pages/Order';
import Reports from './pages/Reports';
import Histogram from './pages/Histogram';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="brand">
            <Coffee className="brand-icon" size={32} />
            <div>
              <h1 style={{ margin: 0 }}>Virtual Cafe</h1>
              <p style={{ margin: 0 }}>Smart Brewing Bar</p>
            </div>
          </div>
          
          <nav className="nav-menu">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
              <Coffee size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/order" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ClipboardList size={20} />
              <span>Place Order</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileBarChart size={20} />
              <span>Reports</span>
            </NavLink>
            <NavLink to="/histogram" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} />
              <span>Analytics</span>
            </NavLink>
          </nav>
          
          <div className="sidebar-footer">
            <div className="status-badge">
              <span className="pulse-indicator"></span>
              System Online
            </div>
          </div>
        </aside>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/order" element={<Order />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/histogram" element={<Histogram />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
