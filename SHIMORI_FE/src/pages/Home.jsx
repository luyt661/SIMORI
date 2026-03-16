import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  // Dữ liệu mẫu cho Collection
  const collections = [
    {
      id: 1,
      title: "The Solitaire Collection",
      price: "$1,200",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070"
    },
    {
      id: 2,
      title: "Royal Halo Series",
      price: "$2,500",
      image: "https://images.unsplash.com/photo-1588444839799-eb6bd27e386a?q=80&w=2070"
    },
    {
      id: 3,
      title: "Vintage Eternity",
      price: "$1,850",
      image: "https://images.unsplash.com/photo-1598560912015-f98f9f76a390?q=80&w=2070"
    },
    {
      id: 4,
      title: "Modern Minimalist",
      price: "$950",
      image: "https://images.unsplash.com/photo-1603561591411-071c4f71a9a9?q=80&w=2070"
    }
  ];

  const steps = [
    { icon: "token", title: "Select", desc: "Choose your base metal and stone type." },
    { icon: "Auto_Fix", title: "Customize", desc: "Adjust band width and textures in 3D." },
    { icon: "visibility", title: "Preview", desc: "View your masterpiece in ultra-high definition." },
    { icon: "shopping_cart", title: "Order", desc: "Handcrafted and delivered to your door." }
  ];

  return (
    <div className="bg-white text-slate-900 font-['Manrope'] min-h-screen flex flex-col">
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* --- HEADER THIẾT KẾ THEO ẢNH --- */}
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-2xl">diamond</span>
            <h2 className="text-xl font-extrabold tracking-tighter uppercase">SHIMORI</h2>
          </div>

          {/* Menu */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Collections', id: 'collections' },
              { label: 'Process', id: 'process' },
              { label: 'About', id: 'about' }
            ].map((item) => (
              <a 
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(item.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6 flex-1 justify-end max-w-2xl">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder="Find your style..." 
              className="w-full bg-gray-50 border-none rounded-full py-2.5 pl-11 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#facc15]/50 outline-none transition-all"
            />
          </div>

          {/* Action Buttons */}
          <button 
            onClick={() => navigate('/design')}
            className="bg-[#facc15] text-black px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-md"
          >
            Design Now
          </button>

          <Link 
            to="/login"
            className="text-black px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest hover:text-[#facc15] transition-all"
          >
            Sign In
          </Link>

          <div className="flex items-center gap-4 text-gray-400">
            <span className="material-symbols-outlined cursor-pointer hover:text-black transition-colors">favorite</span>
            <div className="relative">
              <span className="material-symbols-outlined cursor-pointer hover:text-black transition-colors">shopping_bag</span>
              <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">1</span>
            </div>
            <span className="material-symbols-outlined cursor-pointer hover:text-black transition-colors">person</span>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="High-resolution cinematic shot" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom" 
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70"></div>
        </div>
        
        <div className="relative z-20 max-w-5xl px-4 text-center">
          <h1 className="text-white text-5xl md:text-[90px] font-extrabold leading-[1] tracking-tighter mb-8 drop-shadow-2xl">
            Custom Jewelry <br />
            <span className="text-[#facc15] italic font-light serif">Design Your Story</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto opacity-90">
            Experience the art of 3D jewelry design. Craft a piece as unique as your journey with our immersive high-definition studio.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button 
              onClick={() => navigate('/design')}
              className="bg-[#facc15] hover:bg-white text-black px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl transition-all hover:-translate-y-1"
            >
              Start Designing
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all">
              View Gallery
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED COLLECTION - Giữ nguyên */}
      <section id="collections" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-[#facc15] font-black uppercase tracking-[0.3em] text-[10px]">Exquisite Selection</span>
            <h2 className="text-slate-900 text-4xl font-black mt-2 tracking-tight uppercase">Featured Collection</h2>
          </div>
          <button className="text-[#facc15] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
            Shop All Collections <span className="material-symbols-outlined">arrow_right_alt</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {collections.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl mb-6 shadow-xl bg-gray-50 border border-gray-100">
                <img alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={item.image} />
                <button 
                   onClick={(e) => { e.stopPropagation(); navigate('/design'); }}
                   className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black uppercase px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all"
                >
                  Customize
                </button>
              </div>
              <h3 className="text-slate-900 text-lg font-black tracking-tight uppercase">{item.title}</h3>
              <p className="text-[#facc15] font-bold text-sm tracking-widest uppercase mt-1">From {item.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - Giữ nguyên */}
      <section id="process" className="bg-gray-50 border-y border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-slate-900 text-4xl font-black mb-20 tracking-tight uppercase">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center group">
                      <div className="w-20 h-20 bg-white border border-gray-100 shadow-xl text-[#facc15] rounded-full flex items-center justify-center mb-8 group-hover:bg-[#facc15] group-hover:text-black transition-all">
                          <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest mb-4">{step.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed max-w-[180px]">{step.desc}</p>
                  </div>
                ))}
            </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#facc15] font-black uppercase tracking-[0.3em] text-[10px]">Our Story</span>
            <h2 className="text-slate-900 text-4xl font-black mt-4 mb-8 tracking-tight uppercase">About SHIMORI</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              SHIMORI is redefining luxury jewelry through the fusion of traditional craftsmanship and cutting-edge 3D technology. We believe every piece tells a unique story.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Our artisans bring decades of expertise to create heirloom-quality pieces while our immersive 3D studio empowers you to design exactly what you envision. From initial concept to final masterpiece, we're with you every step of the way.
            </p>
            <button className="bg-[#facc15] text-black px-8 py-3 rounded-lg font-black uppercase text-sm tracking-widest hover:bg-black hover:text-[#facc15] transition-all">
              Learn More
            </button>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop" 
              alt="About SHIMORI" 
              className="rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#facc15]/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center border-t border-gray-100 mt-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">© 2026 SHIMORI UNIFIED STUDIO</p>
      </footer>

      <style>{`
        @keyframes slow-zoom { from { transform: scale(1); } to { transform: scale(1.1); } }
        .animate-slow-zoom { animation: slow-zoom 20s infinite alternate ease-in-out; }
      `}</style>
    </div>
  );
};

export default Home;