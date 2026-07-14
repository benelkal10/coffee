import React, { useState } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Select from '../components/Select';

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
      const response = await fetch(`/api/reports?year=${year}&month=${month}`);
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

  const yearOptions = years.map(y => ({ value: y, label: String(y) }));
  const monthOptions = months;

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Monthly Reports
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Query and export monthly coffee preparation logs to Excel spreadsheets.</p>
      </div>

      <Card variant="default" style={{ padding: '2.5rem' }}>
        <form onSubmit={handleExport} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Alerts */}
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message="Excel sheet generated and downloaded!" />}

          {/* Year Select */}
          <Select
            label="Select Year"
            value={year}
            options={yearOptions}
            onChange={(e) => setYear(parseInt(e.target.value))}
          />

          {/* Month Select */}
          <Select
            label="Select Month"
            value={month}
            options={monthOptions}
            onChange={(e) => setMonth(parseInt(e.target.value))}
          />

          {/* Export Button */}
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            icon={<Download size={20} />}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Exporting...' : 'Export to .xlsx'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
