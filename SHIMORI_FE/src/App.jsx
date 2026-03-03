import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DesignStudio from './pages/DesignStudio';
import ProductDetail from './pages/ProductDetail'; // Import trang chi tiết

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/design" element={<DesignStudio />} />
        <Route path="/product-detail" element={<ProductDetail />} />
      </Routes>
    </Router>
  );
}

export default App;