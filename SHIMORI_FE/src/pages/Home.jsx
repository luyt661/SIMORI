import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { PRODUCTS } from '../data/products';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location]);

  const handleProductClick = (item) => {
    let setting = 'Prong';
    if (item.id === 2) setting = 'Halo';
    else if (item.id === 3) setting = 'Channel';
    
    navigate(`/design?setting=${setting}`);
  };

  const steps = [
    { icon: "token", title: "Select", desc: "Choose your base metal and stone type." },
    { icon: "Auto_Fix", title: "Customize", desc: "Adjust band width and textures in 3D." },
    { icon: "visibility", title: "Preview", desc: "View your masterpiece in ultra-high definition." },
    { icon: "shopping_cart", title: "Order", desc: "Handcrafted and delivered to your door." }
  ];

  return (
    <div className="bg-white text-slate-900 font-['Manrope'] min-h-screen flex flex-col">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="High-resolution cinematic shot"
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=70&w=1200&auto=format&fit=crop"
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
            <button
              onClick={() => navigate('/my-designs')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all"
            >
              My Designs
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
          {PRODUCTS.map((item) => (
            <div key={item.id} className="group cursor-pointer" onClick={() => handleProductClick(item)}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl mb-6 shadow-xl bg-gray-50 border border-gray-100">
                <img alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={item.image} />
                <button
                   onClick={(e) => { e.stopPropagation(); handleProductClick(item); }}
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
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=70&w=800&auto=format&fit=crop"
              alt="About SHIMORI"
              loading="lazy"
              className="rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#facc15]/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center border-t border-gray-100 mt-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">© 2026 SHIMORI UNIFIED STUDIO</p>
      </footer>

    </div>
  );
};

export default Home;
