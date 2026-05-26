import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const DesignStudio = lazy(() => import('./pages/DesignStudio'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login = lazy(() => import('./pages/Login'));
const Checkout = lazy(() => import('./pages/Checkout'));

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#b08d26] border-t-transparent rounded-full" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/design" element={<DesignStudio />} />
          <Route path="/product-detail/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;