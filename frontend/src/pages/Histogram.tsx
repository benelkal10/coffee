import { useEffect, useState } from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';

interface HistogramData {
  labels: string[];
  data: number[];
}

export default function Histogram() {
  const [chartData, setChartData] = useState<HistogramData>({ labels: [], data: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistogram = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/histogram');
      if (!response.ok) throw new Error('Failed to fetch histogram data');
      const data = await response.json();
      setChartData(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistogram();
  }, []);

  const maxVal = chartData.data.length > 0 ? Math.max(...chartData.data) : 10;
  // Chart geometry parameters
  const chartHeight = 300;
  const chartWidth = 500;
  const paddingLeft = 40;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 20;

  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Analytics & Stats
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Visualize coffee ordering frequencies per team member.</p>
        </div>
        <button 
          onClick={fetchHistogram}
          disabled={loading}
          style={{
            background: 'rgba(217, 119, 6, 0.1)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '0.75rem',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(217, 119, 6, 0.1)'}
        >
          <RotateCcw size={16} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </header>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '5rem' }}>Loading analytics data...</div>
      ) : chartData.labels.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No analytics data available yet. Place some orders first!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Custom SVG Interactive Bar Chart */}
          <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', alignSelf: 'flex-start' }}>Coffee Orders per User</h3>
            
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                style={{ width: '100%', height: 'auto', overflow: 'visible' }}
              >
                {/* Horizontal Grid lines & Y Axis labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = paddingTop + graphHeight * (1 - ratio);
                  const labelValue = Math.round(maxVal * ratio);
                  return (
                    <g key={index}>
                      <line 
                        x1={paddingLeft} 
                        y1={y} 
                        x2={chartWidth - paddingRight} 
                        y2={y} 
                        stroke="var(--border-color)" 
                        strokeWidth="1"
                      />
                      <text 
                        x={paddingLeft - 10} 
                        y={y + 4} 
                        fill="var(--text-secondary)" 
                        fontSize="10" 
                        textAnchor="end"
                      >
                        {labelValue}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis line */}
                <line 
                  x1={paddingLeft} 
                  y1={chartHeight - paddingBottom} 
                  x2={chartWidth - paddingRight} 
                  y2={chartHeight - paddingBottom} 
                  stroke="var(--border-color)" 
                  strokeWidth="1"
                />

                {/* Columns */}
                {chartData.labels.map((label, index) => {
                  const val = chartData.data[index];
                  const barCount = chartData.labels.length;
                  const colSpacing = graphWidth / barCount;
                  
                  const barWidth = Math.min(30, colSpacing * 0.6);
                  const x = paddingLeft + (index * colSpacing) + (colSpacing - barWidth) / 2;
                  
                  const ratio = val / maxVal;
                  const barHeight = graphHeight * ratio;
                  const y = chartHeight - paddingBottom - barHeight;

                  return (
                    <g key={index} style={{ cursor: 'pointer' }}>
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={barHeight} 
                        fill="url(#barGradient)" 
                        rx="4"
                        style={{
                          transition: 'height 0.5s ease-out, y 0.5s ease-out, fill 0.2s',
                          filter: 'drop-shadow(0px 4px 10px rgba(217, 119, 6, 0.15))'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.fill = 'var(--accent-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.fill = 'url(#barGradient)';
                        }}
                      />
                      {/* Tooltip on top of bar */}
                      <text 
                        x={x + barWidth / 2} 
                        y={y - 6} 
                        fill="var(--text-primary)" 
                        fontSize="10" 
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {val}
                      </text>
                      {/* X Axis label */}
                      <text 
                        x={x + barWidth / 2} 
                        y={chartHeight - paddingBottom + 18} 
                        fill="var(--text-secondary)" 
                        fontSize="10" 
                        textAnchor="middle"
                        transform={`rotate(15, ${x + barWidth / 2}, ${chartHeight - paddingBottom + 18})`}
                      >
                        {label.length > 8 ? `${label.substring(0, 8)}...` : label}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-secondary)" />
                    <stop offset="100%" stopColor="var(--accent-primary)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
