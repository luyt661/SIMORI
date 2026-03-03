import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID sản phẩm từ URL nếu cần

  // Cập nhật 4 ảnh thực tế: Chính diện, Nghiêng, Cận cảnh, và Lifestyle
  const thumbnails = [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070", // Ảnh 1: Chính diện
    "https://images.unsplash.com/photo-1588444839799-eb6bd27e386a?q=80&w=2070", // Ảnh 2: Góc nghiêng
    "https://images.unsplash.com/photo-1598560912015-f98f9f76a390?q=80&w=2070", // Ảnh 3: Cận cảnh viên chủ
    "https://images.unsplash.com/photo-1603561591411-071c4f71a9a9?q=80&w=2070"  // Ảnh 4: Hộp đựng sang trọng
  ];

  // Khởi tạo ảnh chính mặc định là ảnh đầu tiên
  const [mainImage, setMainImage] = useState(thumbnails[0]);

  return (
    <div className="bg-white dark:bg-[#1a1a1a] font-['Manrope'] min-h-screen text-slate-900 dark:text-white">
      {/* Nạp Font & Icons */}
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

      {/* REUSE HEADER */}
      <header className="h-20 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-10 sticky top-0 z-[100] backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-2xl text-[#facc15]">diamond</span>
            <h2 className="text-xl font-extrabold tracking-tighter uppercase dark:text-white">SHIMORI</h2>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            {['Collections', 'Process', 'About', 'Bespoke'].map((item) => (
              <a key={item} href="#" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-[#facc15] transition-colors">
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/design')}
            className="bg-[#facc15] text-black px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-md"
          >
            Design Now
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* LEFT: IMAGE GALLERY */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-square bg-slate-100 dark:bg-[#2a2a2a] rounded-3xl overflow-hidden group relative shadow-2xl">
              <img 
                alt="Classic Diamond Solitaire Ring" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                src={mainImage}
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-md text-white px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-black cursor-pointer hover:bg-[#facc15] hover:text-black transition-all">
                <span className="material-symbols-outlined !text-sm">view_in_ar</span>
                Interactive 3D View
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {thumbnails.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${mainImage === img ? 'border-[#facc15] scale-95' : 'border-transparent hover:opacity-80'}`}
                >
                  <img alt={`Angle ${idx}`} className="w-full h-full object-cover" src={img}/>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <nav className="flex text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-6 gap-2">
              <a className="hover:text-[#facc15]" href="#" onClick={() => navigate('/')}>Home</a>
              <span>/</span>
              <a className="hover:text-[#facc15]" href="#">Engagement Rings</a>
            </nav>

            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tighter uppercase">
              Classic Celestial <br/> Diamond Solitaire
            </h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-[#facc15]">
                {[1,2,3,4].map(i => <span key={i} className="material-symbols-outlined !text-sm">star</span>)}
                <span className="material-symbols-outlined !text-sm">star_half</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">4.9 (124 reviews)</span>
            </div>

            <p className="text-4xl font-light mb-10 text-[#facc15] tracking-tighter">$18,400.00</p>

            <div className="space-y-6 mb-10">
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-sm font-medium">
                A masterpiece of timeless design, our Celestial Solitaire features a hand-selected 2.5-carat brilliant-cut diamond, set in a meticulously polished 18k recycled gold band. Each facet is engineered to maximize light dispersion.
              </p>
              
              <div className="grid grid-cols-2 gap-y-8 border-y border-gray-100 dark:border-white/10 py-10">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">Carat Weight</span>
                  <span className="text-sm font-black uppercase">2.55 Carats</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">Material</span>
                  <span className="text-sm font-black uppercase">18k Solid Yellow Gold</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">Clarity</span>
                  <span className="text-sm font-black uppercase">VVS1 - Exceptional</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">Cut Grade</span>
                  <span className="text-sm font-black uppercase">Ideal Hearts & Arrows</span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="space-y-4 mt-auto">
              <div className="flex gap-4">
                <button className="flex-1 bg-[#facc15] text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl">
                  <span className="material-symbols-outlined text-lg">shopping_cart</span>
                  Add to Bag
                </button>
                <button className="p-5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined">favorite</span>
                </button>
              </div>
              <button 
                onClick={() => navigate('/design')}
                className="w-full bg-black dark:bg-white dark:text-black text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:opacity-80 transition-all border border-black dark:border-white"
              >
                Customize with 3D Studio
              </button>
            </div>
            
            <div className="mt-10 flex items-center gap-8 justify-center lg:justify-start opacity-50">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined !text-lg text-[#facc15]">verified</span>
                Lifetime Warranty
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined !text-lg text-[#facc15]">local_shipping</span>
                Secure Delivery
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t border-gray-100 dark:border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
          <p>© 2026 SHIMORI FINE JEWELRY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a className="hover:text-[#facc15] transition-colors" href="#">Privacy</a>
            <a className="hover:text-[#facc15] transition-colors" href="#">Terms</a>
            <a className="hover:text-[#facc15] transition-colors" href="#">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;