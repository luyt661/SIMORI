import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { PRODUCTS } from '../data/products';
import imgFront from '../demo-images/front.png';
import imgSide from '../demo-images/side.png';
import imgClose from '../demo-images/close.png';
import imgLifestyle from '../demo-images/lifestyle.png';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const product = PRODUCTS.find((p) => p.id === Number(id)) || PRODUCTS[0];

  const thumbnails = [imgFront, imgSide, imgClose, imgLifestyle];
  const [mainImage, setMainImage] = useState(thumbnails[0]);

  const handleCustomize = () => {
    const params = new URLSearchParams();
    
    // Default mapped values
    let gemstone = 'Diamond';
    let material = 'Bạc';
    let setting = 'Prong';
    let carat = 2.0;

    if (product.id === 2) {
      setting = 'Halo';
      gemstone = 'Diamond';
    } else if (product.id === 3) {
      setting = 'Channel';
      gemstone = 'Diamond';
    }

    if (product.specs?.Material?.includes('Gold') || product.specs?.Material?.includes('Yellow')) {
      material = 'Bạc';
    }

    const caratVal = parseFloat(product.specs?.['Carat Weight']);
    if (!isNaN(caratVal)) {
      carat = caratVal;
    }

    params.set('gemstone', gemstone);
    params.set('material', material);
    params.set('setting', setting);
    params.set('carat', carat.toString());

    navigate(`/design?${params.toString()}`);
  };

  const addToCart = () => {
    const rawCart = localStorage.getItem('shimori_cart');
    let cart = [];
    if (rawCart) {
      try {
        cart = JSON.parse(rawCart);
      } catch (e) {
        cart = [];
      }
    }

    const cartItem = {
      id: Date.now(),
      title: product.fullTitle,
      config: {
        setting: product.id === 2 ? 'Halo' : product.id === 3 ? 'Channel' : 'Prong',
        material: 'Bạc',
        gemstone: 'Diamond',
        bandStyle: 'Plain',
        width: 2.5,
      },
      gemCarat: parseFloat(product.specs?.['Carat Weight']) || 2.0,
      engraving: '',
      engravingFont: 'Script',
      price: parseInt(product.price.replace(/[^0-9]/g, '')),
      gemColor: 'bg-white shadow-inner border border-gray-200',
    };

    const updated = [...cart, cartItem];
    localStorage.setItem('shimori_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    
    toast.success(`Đã thêm ${product.title} vào Giỏ hàng!`, {
      style: { background: '#1a1a1a', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
    });

    setTimeout(() => {
      navigate('/design?openCart=true');
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] font-['Manrope'] min-h-screen text-slate-900 dark:text-white">
      <Toaster position="bottom-right" reverseOrder={false} />
      <Navbar />

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
              <div 
                onClick={handleCustomize}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-md text-white px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.2em] font-black cursor-pointer hover:bg-[#facc15] hover:text-black transition-all"
              >
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
              <a className="hover:text-[#facc15]" href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
              <span>/</span>
              <a className="hover:text-[#facc15]" href="#" onClick={(e) => e.preventDefault()}>Engagement Rings</a>
            </nav>

            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tighter uppercase">
              {product.fullTitle}
            </h2>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-[#facc15]">
                {[1,2,3,4].map(i => <span key={i} className="material-symbols-outlined !text-sm">star</span>)}
                <span className="material-symbols-outlined !text-sm">star_half</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <p className="text-4xl font-light mb-10 text-[#facc15] tracking-tighter">From {product.price}</p>

            <div className="space-y-6 mb-10">
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-sm font-medium">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-y-8 border-y border-gray-100 dark:border-white/10 py-10">
                {Object.entries(product.specs).map(([label, value]) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</span>
                    <span className="text-sm font-black uppercase">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="space-y-4 mt-auto">
              <div className="flex gap-4">
                <button 
                  onClick={addToCart}
                  className="flex-1 bg-[#facc15] text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <span className="material-symbols-outlined text-lg">shopping_cart</span>
                  Add to Bag
                </button>
                <button 
                  onClick={() => toast.success('Đã thêm sản phẩm vào danh sách yêu thích!')}
                  className="p-5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined">favorite</span>
                </button>
              </div>
              <button 
                onClick={handleCustomize}
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