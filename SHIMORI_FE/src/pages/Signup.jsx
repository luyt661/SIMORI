import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/axios';


const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.username.trim()) {
      nextErrors.username = 'Username cannot be empty';
    } else if (form.username.trim().length < 3) {
      nextErrors.username = 'Username must be at least 3 characters';
    }

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Full name cannot be empty';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email cannot be empty';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = 'Invalid email';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Password cannot be empty';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (!form.confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      await api.post('/auth/register', {
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      toast.success('Registration successful! Please log in.');

      setTimeout(() => {
        navigate('/login');
      }, 800);
    } catch (err) {
      console.error(err);

      const data = err.response?.data;

      if (data?.field) {
        setErrors({
          [data.field]: data.message,
        });
      }

      toast.error(data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#5A3925' }}>
      <Toaster position="bottom-right" reverseOrder={false} />

      <div style={{
        display: 'none',
        width: '50%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, #5A3925, #6B442B)',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
      }} className="lg:flex lg:flex-col lg:justify-between">
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
        }}>
          <div style={{
            position: 'absolute',
            width: 384,
            height: 384,
            backgroundColor: '#D7A36F',
            borderRadius: '9999px',
            filter: 'blur(80px)',
            top: -80,
            left: -80,
          }}></div>
          <div style={{
            position: 'absolute',
            width: 384,
            height: 384,
            backgroundColor: '#B87948',
            borderRadius: '9999px',
            filter: 'blur(80px)',
            top: 160,
            right: -160,
          }}></div>
          <div style={{
            position: 'absolute',
            width: 384,
            height: 384,
            backgroundColor: '#D7A36F',
            borderRadius: '9999px',
            filter: 'blur(80px)',
            bottom: 80,
            left: '33%',
          }}></div>
        </div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span className="material-symbols-outlined" style={{ color: '#D7A36F', fontSize: 40 }}>
            diamond
          </span>
          <h1 style={{ color: '#FFF3E4', fontSize: 30, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>SHIMORI</h1>
        </div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=70&w=800&auto=format&fit=crop"
            alt="Diamond Ring"
            style={{ width: 384, height: 384, objectFit: 'cover', borderRadius: 12, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <h2 style={{ color: '#FFF3E4', fontSize: 30, fontWeight: 700, marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>
            Create your SHIMORI account.
          </h2>
          <p style={{ color: '#E8C9A8', fontSize: 18 }}>
            Save designs, continue drafts, and build your jewelry collection.
          </p>
        </div>
      </div>

      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6A452D',
        padding: '48px 24px',
        borderLeft: '1px solid rgba(243, 214, 182, 0.25)',
      }} className="lg:w-1/2 lg:px-12">
        <div style={{ width: '100%', maxWidth: 448 }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: '#FFF3E4', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>
              Create Account
            </h1>
            <p style={{ color: '#E8C9A8', fontSize: 16 }}>
              Join SHIMORI and start designing your own jewelry.
            </p>
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#E8C9A8', marginBottom: 8 }}>
                Username
              </label>

              <input
                type="text"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="demo"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${errors.username ? '#b91c1c' : 'rgba(243, 214, 182, 0.25)'}`,
                  borderRadius: 8,
                  outline: 'none',
                  backgroundColor: '#6B442B',
                  color: '#FFF3E4',
                  fontSize: 16,
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  boxShadow: errors.username ? '0 0 0 2px rgba(185,28,28,0.3)' : undefined,
                }}
                onFocus={(e) => {
                  if (!errors.username) {
                    e.target.style.boxShadow = '0 0 0 2px rgba(192,147,108,0.4)';
                    e.target.style.borderColor = '#D7A36F';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.username) {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'rgba(243, 214, 182, 0.25)';
                  }
                }}
              />

              {errors.username && (
                <p style={{ color: '#b91c1c', fontSize: 12, marginTop: 8, fontWeight: 500 }}>
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#E8C9A8', marginBottom: 8 }}>
                Full Name
              </label>

              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Shimori User"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${errors.fullName ? '#b91c1c' : 'rgba(243, 214, 182, 0.25)'}`,
                  borderRadius: 8,
                  outline: 'none',
                  backgroundColor: '#6B442B',
                  color: '#FFF3E4',
                  fontSize: 16,
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  boxShadow: errors.fullName ? '0 0 0 2px rgba(185,28,28,0.3)' : undefined,
                }}
                onFocus={(e) => {
                  if (!errors.fullName) {
                    e.target.style.boxShadow = '0 0 0 2px rgba(192,147,108,0.4)';
                    e.target.style.borderColor = '#D7A36F';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.fullName) {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'rgba(243, 214, 182, 0.25)';
                  }
                }}
              />

              {errors.fullName && (
                <p style={{ color: '#b91c1c', fontSize: 12, marginTop: 8, fontWeight: 500 }}>
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#E8C9A8', marginBottom: 8 }}>
                Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${errors.email ? '#b91c1c' : 'rgba(243, 214, 182, 0.25)'}`,
                  borderRadius: 8,
                  outline: 'none',
                  backgroundColor: '#6B442B',
                  color: '#FFF3E4',
                  fontSize: 16,
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  boxShadow: errors.email ? '0 0 0 2px rgba(185,28,28,0.3)' : undefined,
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.target.style.boxShadow = '0 0 0 2px rgba(192,147,108,0.4)';
                    e.target.style.borderColor = '#D7A36F';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'rgba(243, 214, 182, 0.25)';
                  }
                }}
              />

              {errors.email && (
                <p style={{ color: '#b91c1c', fontSize: 12, marginTop: 8, fontWeight: 500 }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#E8C9A8', marginBottom: 8 }}>
                Password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="●●●●●●●●"
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    border: `1px solid ${errors.password ? '#b91c1c' : 'rgba(243, 214, 182, 0.25)'}`,
                    borderRadius: 8,
                    outline: 'none',
                    backgroundColor: '#6B442B',
                    color: '#FFF3E4',
                    fontSize: 16,
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    boxShadow: errors.password ? '0 0 0 2px rgba(185,28,28,0.3)' : undefined,
                  }}
                  onFocus={(e) => {
                    if (!errors.password) {
                      e.target.style.boxShadow = '0 0 0 2px rgba(192,147,108,0.4)';
                      e.target.style.borderColor = '#D7A36F';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.password) {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = 'rgba(243, 214, 182, 0.25)';
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#B99372',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#E8C9A8'}
                  onMouseLeave={(e) => e.target.style.color = '#B99372'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {errors.password && (
                <p style={{ color: '#b91c1c', fontSize: 12, marginTop: 8, fontWeight: 500 }}>
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#E8C9A8', marginBottom: 8 }}>
                Confirm Password
              </label>

              <input
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) =>
                  handleChange('confirmPassword', e.target.value)
                }
                placeholder="●●●●●●●●"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${errors.confirmPassword ? '#b91c1c' : 'rgba(243, 214, 182, 0.25)'}`,
                  borderRadius: 8,
                  outline: 'none',
                  backgroundColor: '#6B442B',
                  color: '#FFF3E4',
                  fontSize: 16,
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  boxShadow: errors.confirmPassword ? '0 0 0 2px rgba(185,28,28,0.3)' : undefined,
                }}
                onFocus={(e) => {
                  if (!errors.confirmPassword) {
                    e.target.style.boxShadow = '0 0 0 2px rgba(192,147,108,0.4)';
                    e.target.style.borderColor = '#D7A36F';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.confirmPassword) {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'rgba(243, 214, 182, 0.25)';
                  }
                }}
              />

              {errors.confirmPassword && (
                <p style={{ color: '#b91c1c', fontSize: 12, marginTop: 8, fontWeight: 500 }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#B99372' : 'linear-gradient(135deg, #D7A36F, #B87948)',
                color: '#140c05',
                padding: '12px 0',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 18,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 32,
                transition: 'opacity 0.2s',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.opacity = '1';
              }}
            >
              {loading ? 'Creating...' : 'Create Account'}
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                arrow_forward
              </span>
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#B99372', marginTop: 32, fontSize: 15 }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ fontWeight: 600, color: '#D7A36F', textDecoration: 'none' }}
              onMouseEnter={(e) => e.target.style.color = '#F3D6B6'}
              onMouseLeave={(e) => e.target.style.color = '#D7A36F'}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
