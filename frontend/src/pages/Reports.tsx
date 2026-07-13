import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`http://localhost:5000/api/reports?year=${year}&month=${month}`);
      if (!response.ok) {
        const errResult = await response.json();
        throw new Error(errResult.error || 'Failed to fetch report data.');
      }
      
      const orders = await response.json();

      if (orders.length === 0) {
        throw new Error('No orders found for the selected month.');
      }

      // Map data for clean Excel export formatting
      const exportData = orders.map((order: any) => ({
        'Order ID': order._id,
        'User Name': order.userName,
        'Role': order.role,
        'Preparation Time': order.timeType,
        'Delay (Min)': order.delayMinutes,
        'Priority Level': order.priority === 1 ? 'High (Boss)' : 'Normal',
        'Status': order.done ? 'Ready' : 'Pending',
        'Ordered At': new Date(order.createdAt).toLocaleString(),
        'Completed At': order.completedAt ? new Date(order.completedAt).toLocaleString() : 'N/A'
      }));

      // Generate worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-fit column widths in a single pass
      const colWidths = Object.keys(exportData[0] || {}).map(key => {
        let maxLen = key.length;
        for (let i = 0; i < exportData.length; i++) {
          const valLen = String(exportData[i][key] || '').length;
          if (valLen > maxLen) {
            maxLen = valLen;
          }
        }
        return { wch: maxLen + 2 };
      });
      worksheet['!cols'] = colWidths;

      // Generate workbook and download
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Coffee Orders');
      
      XLSX.writeFile(workbook, `Coffee_Orders_${year}_${String(month).padStart(2, '0')}.xlsx`);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error occurred during export.');
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #f5efe6, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Monthly Reports
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Query and export monthly coffee preparation logs to Excel spreadsheets.</p>
      </div>

      <form onSubmit={handleExport} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Status Alerts */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
            <span>Excel sheet generated and downloaded!</span>
          </div>
        )}

        {/* Year Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select Year</label>
          <select 
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Month Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Select Month</label>
          <select 
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Export Button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{
            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
            border: 'none',
            color: '#fff',
            padding: '1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.3s',
            marginTop: '1rem',
            boxShadow: '0 4px 14px 0 var(--accent-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Download size={20} />
          <span>{loading ? 'Exporting...' : 'Export to .xlsx'}</span>
        </button>
      </form>
    </div>
  );
}
