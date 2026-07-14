import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Input from '../components/Input';

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
      const response = await fetch('/api/orders', {
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
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, var(--text-primary), var(--accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Order Coffee
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Request a fresh cup of coffee. Boss requests get priority.</p>
      </div>

      <Card variant="default" style={{ padding: '2.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Status Alerts */}
          {validationError && <Alert type="error" message={validationError} />}
          {submitError && <Alert type="error" message={submitError} />}
          {success && <Alert type="success" message="Coffee order successfully sent to queue!" />}

          {/* User Name input */}
          <Input 
            label="Your Name"
            type="text" 
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />

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
            <Input 
              className="fade-in"
              label="Authorization Password"
              type="password" 
              placeholder="Enter VIP Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
            <Input 
              className="fade-in"
              label="Delay Minutes"
              type="number" 
              min="1"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 1)}
            />
          )}

          {/* Submit */}
          <Button 
            type="submit" 
            disabled={loading}
            variant="primary"
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Submitting Order...' : 'Submit Coffee Request'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
