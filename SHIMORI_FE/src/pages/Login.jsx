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
      nextErrors.email = 'Email không được để trống';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = 'Email không hợp lệ';
    }

    if (!password.trim()) {
      nextErrors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
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
        throw new Error('Backend không trả token');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('shimori_logged_in', 'true');

      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      toast.success('Đăng nhập thành công!');

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

      toast.error(data?.message || 'Sai email hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="hidden lg:w-1/2 lg:flex lg:flex-col lg:justify-between bg-gradient-to-b from-gray-900 to-gray-800 p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-96 h-96 bg-amber-500 rounded-full blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 bg-amber-400 rounded-full blur-3xl top-40 -right-40"></div>
          <div className="absolute w-96 h-96 bg-amber-500 rounded-full blur-3xl bottom-20 left-1/3"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-4xl">
            diamond
          </span>
          <h1 className="text-white text-3xl font-bold">SHIMORI</h1>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=70&w=800&auto=format&fit=crop"
            alt="Diamond Ring"
            className="w-96 h-96 object-cover rounded-lg shadow-2xl"
          />
        </div>

        <div className="relative z-10">
          <h2 className="text-white text-3xl font-bold mb-3">
            Crafting your digital legacy, one facet at a time.
          </h2>
          <p className="text-gray-300 text-lg">
            Experience the future of bespoke jewelry.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Please enter your details to access your collection.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 ${
                  errors.email
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-yellow-400'
                }`}
              />

              {errors.email && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-yellow-500 hover:text-yellow-600"
                >
                  FORGOT?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="●●●●●●●●"
                  className={`w-full px-4 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-gray-200 focus:ring-yellow-400'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 py-3 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 mt-8"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <span className="material-symbols-outlined text-xl">
                arrow_forward
              </span>
            </button>
          </form>

          <p className="text-center text-gray-600 mt-8">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-yellow-500 hover:text-yellow-600"
            >
              Create an Account
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
            <Link
              to="/home"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-lg font-medium transition-colors text-center"
            >
              Home
            </Link>

            <Link
              to="/design"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-lg font-medium transition-colors text-center"
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