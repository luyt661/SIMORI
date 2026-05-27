import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const DesignStudio = lazy(() => import('./pages/DesignStudio'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const MyDesigns = lazy(() => import('./pages/MyDesigns'));

function App() {

  return (
    <Router>

      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#b08d26] border-t-transparent rounded-full" />
          </div>
        }
      >

        <Routes>

          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Main Pages */}
          <Route path="/home" element={<Home />} />
          <Route path="/design" element={<DesignStudio />} />

          {/* MY DESIGNS */}
          <Route path="/my-designs" element={<MyDesigns />} />

          <Route path="/product-detail/:id" element={<ProductDetail />} />

        </Routes>

      </Suspense>

    </Router>
  );
}

export default App;