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
      nextErrors.username = 'Username không được để trống';
    } else if (form.username.trim().length < 3) {
      nextErrors.username = 'Username phải có ít nhất 3 ký tự';
    }

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Họ tên không được để trống';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email không được để trống';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = 'Email không hợp lệ';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Mật khẩu không được để trống';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!form.confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu';
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Mật khẩu nhập lại không khớp';
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

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');

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

      toast.error(data?.message || 'Đăng ký thất bại!');
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
            Create your SHIMORI account.
          </h2>
          <p className="text-gray-300 text-lg">
            Save designs, continue drafts, and build your jewelry collection.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join SHIMORI and start designing your own jewelry.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>

              <input
                type="text"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="demo"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 ${
                  errors.username
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-yellow-400'
                }`}
              />

              {errors.username && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Shimori User"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 ${
                  errors.fullName
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-yellow-400'
                }`}
              />

              {errors.fullName && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>

              <input
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) =>
                  handleChange('confirmPassword', e.target.value)
                }
                placeholder="●●●●●●●●"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 ${
                  errors.confirmPassword
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-yellow-400'
                }`}
              />

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-2 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 py-3 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 mt-8"
            >
              {loading ? 'Creating...' : 'Create Account'}
              <span className="material-symbols-outlined text-xl">
                arrow_forward
              </span>
            </button>
          </form>

          <p className="text-center text-gray-600 mt-8">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-yellow-500 hover:text-yellow-600"
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