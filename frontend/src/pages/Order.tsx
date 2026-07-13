import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Order() {
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState<'employee' | 'boss'>('employee');
  const [password, setPassword] = useState('');
  const [timeType, setTimeType] = useState<'now' | 'later'>('now');
  const [delayMinutes, setDelayMinutes] = useState<number>(1);
  
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitError(null);
    setSuccess(false);

    // Form validations
    if (!userName.trim()) {
      setValidationError('Name is required.');
      return;
    }
    if (userName.trim().length < 2) {
      setValidationError('Name must be at least 2 characters.');
      return;
    }
    if (role === 'boss' && !password) {
      setValidationError('Boss authorization password is required.');
      return;
    }
    if (timeType === 'later' && (isNaN(delayMinutes) || delayMinutes < 1)) {
      setValidationError('Delay must be at least 1 minute.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userName.trim(),
          role,
          password: role === 'boss' ? password : undefined,
          timeType,
          delayMinutes: timeType === 'later' ? delayMinutes : 0,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order.');
      }

      setSuccess(true);
      // Reset form fields
      setUserName('');
      setPassword('');
      setTimeType('now');
      setDelayMinutes(1);
    } catch (err: any) {
      setSubmitError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #f5efe6, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Order Coffee
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Request a fresh cup of coffee. Boss requests get priority.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Status Alerts */}
        {validationError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
            <span>{validationError}</span>
          </div>
        )}
        {submitError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
            <span>{submitError}</span>
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
            <span>Coffee order successfully sent to queue!</span>
          </div>
        )}

        {/* User Name input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Your Name</label>
          <input 
            type="text" 
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        {/* Role select (Radio buttons) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Role</label>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
              <input 
                type="radio" 
                name="role" 
                value="employee" 
                checked={role === 'employee'} 
                onChange={() => {
                  setRole('employee');
                  setPassword('');
                }}
                style={{ accentColor: 'var(--accent-primary)', width: '1.15rem', height: '1.15rem' }}
              />
              <span>Employee (Normal Queue)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
              <input 
                type="radio" 
                name="role" 
                value="boss" 
                checked={role === 'boss'} 
                onChange={() => {
                  setRole('boss');
                  setPassword('');
                }}
                style={{ accentColor: 'var(--accent-primary)', width: '1.15rem', height: '1.15rem' }}
              />
              <span>Boss (VIP Queue)</span>
            </label>
          </div>
        </div>

        {/* Password input (only if Boss) */}
        {role === 'boss' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Authorization Password</label>
            <input 
              type="password" 
              placeholder="Enter VIP Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
        )}

        {/* Time select (Radio buttons) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Preparation Time</label>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
              <input 
                type="radio" 
                name="timeType" 
                value="now" 
                checked={timeType === 'now'} 
                onChange={() => setTimeType('now')}
                style={{ accentColor: 'var(--accent-primary)', width: '1.15rem', height: '1.15rem' }}
              />
              <span>Prepare Now</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
              <input 
                type="radio" 
                name="timeType" 
                value="later" 
                checked={timeType === 'later'} 
                onChange={() => setTimeType('later')}
                style={{ accentColor: 'var(--accent-primary)', width: '1.15rem', height: '1.15rem' }}
              />
              <span>Prepare Later (Delayed Job)</span>
            </label>
          </div>
        </div>

        {/* Delay Minutes input (only if Later) */}
        {timeType === 'later' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Delay Minutes</label>
            <input 
              type="number" 
              min="1"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 1)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
        )}

        {/* Submit */}
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
            boxShadow: '0 4px 14px 0 var(--accent-glow)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          {loading ? 'Submitting Order...' : 'Submit Coffee Request'}
        </button>
      </form>
    </div>
  );
}
