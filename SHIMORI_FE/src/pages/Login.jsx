import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    // TODO: Add authentication logic later
    console.log('Sign In:', { email, password });
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Left Side - Image Section */}
      <div className="hidden lg:w-1/2 lg:flex lg:flex-col lg:justify-between bg-gradient-to-b from-gray-900 to-gray-800 p-10 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-96 h-96 bg-amber-500 rounded-full blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 bg-amber-400 rounded-full blur-3xl top-40 -right-40"></div>
          <div className="absolute w-96 h-96 bg-amber-500 rounded-full blur-3xl bottom-20 left-1/3"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-500 text-4xl">diamond</span>
            <h1 className="text-white text-3xl font-bold">SHIMORI</h1>
          </div>
        </div>

        {/* Jewelry Image */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3" 
            alt="Diamond Ring" 
            className="w-96 h-96 object-cover rounded-lg shadow-2xl"
          />
        </div>

        {/* Bottom Text */}
        <div className="relative z-10">
          <h2 className="text-white text-3xl font-bold mb-3">Crafting your digital legacy, one facet at a time.</h2>
          <p className="text-gray-300 text-lg">Experience the future of bespoke jewelry.</p>
        </div>
      </div>

      {/* Right Side - Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-600">Please enter your details to access your collection.</p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="material-symbols-outlined text-xl">mail</span>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-yellow-500 hover:text-yellow-600">
                  FORGOT?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="●●●●●●●●"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 mt-8"
            >
              Sign In
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-sm font-medium">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="border border-gray-200 hover:border-gray-300 rounded-lg py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>
            <button className="border border-gray-200 hover:border-gray-300 rounded-lg py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 13.5c-.91 0-1.75-.35-2.36-.92-.61-.59-.95-1.38-.95-2.23 0-.85.34-1.64.95-2.23.61-.57 1.45-.92 2.36-.92s1.75.35 2.36.92c.61.59.95 1.38.95 2.23 0 .85-.34 1.64-.95 2.23-.61.57-1.45.92-2.36.92zm-10.1 0c-.91 0-1.75-.35-2.36-.92C3.98 11.91 3.64 11.12 3.64 10.27c0-.85.34-1.64.95-2.23.61-.57 1.45-.92 2.36-.92s1.75.35 2.36.92c.61.59.95 1.38.95 2.23 0 .85-.34 1.64-.95 2.23-.61.57-1.45.92-2.36.92z"/>
              </svg>
              <span className="hidden sm:inline">Apple</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-yellow-500 hover:text-yellow-600">
              Create an Account
            </Link>
          </p>

          {/* Navigation Links */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
            <Link 
              to="/" 
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
