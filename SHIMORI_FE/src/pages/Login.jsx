import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/axios';


const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email cannot be empty';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = 'Invalid email';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password cannot be empty';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      const token = res.data.token || res.data.accessToken || res.data.jwt;

      if (!token) {
        throw new Error('Backend did not return a token');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('shimori_logged_in', 'true');

      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      toast.success('Login successful!');

      setTimeout(() => {
        navigate('/home');
      }, 700);
    } catch (err) {
      console.error(err);

      const data = err.response?.data;

      if (data?.field) {
        setErrors({
          [data.field]: data.message,
        });
      }

      toast.error(data?.message || 'Invalid email or password!');
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
            Crafting your digital legacy, one facet at a time.
          </h2>
          <p style={{ color: '#E8C9A8', fontSize: 18 }}>
            Experience the future of bespoke jewelry.
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
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: '#FFF3E4', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>
              Welcome Back
            </h1>
            <p style={{ color: '#E8C9A8', fontSize: 16 }}>
              Please enter your details to access your collection.
            </p>
          </div>

          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#E8C9A8', marginBottom: 8 }}>
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: '' }));
                }}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#E8C9A8' }}>
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  style={{ fontSize: 14, fontWeight: 500, color: '#D7A36F', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.target.style.color = '#F3D6B6'}
                  onMouseLeave={(e) => e.target.style.color = '#D7A36F'}
                >
                  FORGOT?
                </Link>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }}
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
              {loading ? 'Signing In...' : 'Sign In'}
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                arrow_forward
              </span>
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#B99372', marginTop: 32, fontSize: 15 }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{ fontWeight: 600, color: '#D7A36F', textDecoration: 'none' }}
              onMouseEnter={(e) => e.target.style.color = '#F3D6B6'}
              onMouseLeave={(e) => e.target.style.color = '#D7A36F'}
            >
              Create an Account
            </Link>
          </p>

          <div style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: '1px solid rgba(243, 214, 182, 0.12)',
            display: 'flex',
            gap: 16,
          }}>
            <Link
              to="/home"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: '1px solid rgba(243, 214, 182, 0.25)',
                color: '#E8C9A8',
                padding: '8px 0',
                borderRadius: 8,
                fontWeight: 500,
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: 14,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(192,147,108,0.1)';
                e.target.style.borderColor = '#D7A36F';
                e.target.style.color = '#F3D6B6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'rgba(243, 214, 182, 0.25)';
                e.target.style.color = '#E8C9A8';
              }}
            >
              Home
            </Link>

            <Link
              to="/design"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: '1px solid rgba(243, 214, 182, 0.25)',
                color: '#E8C9A8',
                padding: '8px 0',
                borderRadius: 8,
                fontWeight: 500,
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: 14,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(192,147,108,0.1)';
                e.target.style.borderColor = '#D7A36F';
                e.target.style.color = '#F3D6B6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'rgba(243, 214, 182, 0.25)';
                e.target.style.color = '#E8C9A8';
              }}
            >
              Design Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
