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
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = 'Username không được để trống';
    }

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name không được để trống';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!form.password.trim()) {
      newErrors.password = 'Password không được để trống';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      toast.success('Đăng ký thành công!');

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      console.error(err);

      const data = err.response?.data;

      if (data?.field === 'email') {
        setErrors((prev) => ({
          ...prev,
          email: data.message || 'Email đã tồn tại',
        }));
        return;
      }

      if (data?.field === 'username') {
        setErrors((prev) => ({
          ...prev,
          username: data.message || 'Username đã tồn tại',
        }));
        return;
      }

      toast.error(data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-500 focus:ring-red-300'
        : 'border-gray-200 focus:ring-yellow-400'
    }`;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12">
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-yellow-500 text-4xl">
              diamond
            </span>

            <h1 className="text-3xl font-bold text-gray-900">SHIMORI</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Account
          </h2>

          <p className="text-gray-500">
            Start crafting your jewelry collection
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
              placeholder="your_username"
              className={inputClass('username')}
            />

            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
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
              placeholder="Nguyen Van A"
              className={inputClass('fullName')}
            />

            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">
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
              className={inputClass('email')}
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
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
                className={`${inputClass('password')} pr-12`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 py-3 rounded-lg font-bold text-lg transition-all"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
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
  );
};

export default Signup;