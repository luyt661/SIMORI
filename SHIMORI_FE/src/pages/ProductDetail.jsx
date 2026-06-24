import { useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import JewelryViewer from '../components/JewelryViewer';
import { PRODUCTS } from '../data/products';
import { modelGroups } from '../models';

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const MATERIAL_CONFIGS = {
  'Titanium':      { color: [0.20, 0.22, 0.27, 1], metallic: 1.0, roughness: 0.40 },
  'Silver':        { color: [0.85, 0.85, 0.87, 1], metallic: 1.0, roughness: 0.05 },
  'Stainless Steel': { color: [0.50, 0.50, 0.52, 1], metallic: 1.0, roughness: 0.20 },
};

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const product = PRODUCTS.find((p) => p.id === Number(id)) || PRODUCTS[0];

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isCustomized = queryParams.get('customized') === 'true';
  const customName = useMemo(() => queryParams.get('name') || '', [queryParams]);

  const activeConfig = useMemo(() => {
    if (isCustomized) {
      return {
        setting: queryParams.get('setting') || 'Prong',
        material: queryParams.get('material') || 'Silver',
        gemstone: queryParams.get('gemstone') || 'Diamond',
        bandStyle: queryParams.get('bandStyle') || 'Plain',
        width: parseFloat(queryParams.get('width') || '2.5'),
        carat: parseFloat(queryParams.get('carat') || '2.0'),
        lighting: queryParams.get('lighting') || 'studio',
      };
    }

    let setting = 'Prong';
    let gemstone = 'Diamond';
    let material = 'Silver';
    let bandStyle = 'Plain';
    let width = 2.5;
    let carat = 2.0;

    if (product.id === 2) {
      setting = 'Halo';
    } else if (product.id === 3) {
      setting = 'Channel';
    }

    const caratVal = parseFloat(product.specs?.['Carat Weight']);
    if (!isNaN(caratVal)) {
      carat = caratVal;
    }

    return {
      setting,
      material,
      gemstone,
      bandStyle,
      width,
      carat,
      lighting: 'studio',
    };
  }, [isCustomized, queryParams, product]);

  const customizedSpecs = useMemo(() => {
    if (!isCustomized) return null;
    return {
      'Stone Setting': activeConfig.setting,
      'Precious Material': activeConfig.material,
      'Primary Gemstone': activeConfig.gemstone,
      'Band Style': activeConfig.bandStyle,
      'Band Width': `${activeConfig.width} mm`,
      'Carat Weight': `${activeConfig.carat.toFixed(1)} ct`,
    };
  }, [isCustomized, activeConfig]);

  const displayPrice = useMemo(() => {
    if (isCustomized) {
      const priceVal = parseInt(queryParams.get('price'), 10);
      if (!isNaN(priceVal)) {
        return `$${priceVal.toLocaleString()}`;
      }
    }
    return product.price;
  }, [isCustomized, queryParams, product.price]);

  const settingModelUrl = useMemo(() => {
    const target = normalize(activeConfig.setting);
    const match = modelGroups.settings.find((m) => normalize(m.name) === target || normalize(m.key) === target);
    return match?.url || modelGroups.settings[0]?.url;
  }, [activeConfig.setting]);

  const gemModelUrl = useMemo(() => {
    const target = normalize(activeConfig.gemstone);
    const match = modelGroups.gems.find((g) => normalize(g.name) === target || normalize(g.key) === target);
    return match?.url || modelGroups.gems[0]?.url;
  }, [activeConfig.gemstone]);

  const materialProps = useMemo(() => {
    return MATERIAL_CONFIGS[activeConfig.material] ?? null;
  }, [activeConfig.material]);

  const widthScale = useMemo(() => {
    return parseFloat((activeConfig.width / 2.5).toFixed(3));
  }, [activeConfig.width]);

  const gemCarat = useMemo(() => activeConfig.carat, [activeConfig.carat]);

  const handleCustomize = () => {
    if (isCustomized) {
      navigate(`/design?${queryParams.toString()}`);
      return;
    }

    const params = new URLSearchParams();

    let gemstone = 'Diamond';
    let material = 'Silver';
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
      material = 'Silver';
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

    const gemstoneColors = {
      'Diamond': 'bg-white/20 shadow-inner border border-white/10',
      'Sapphire': 'bg-blue-600',
      'Ruby': 'bg-red-600',
      'Emerald': 'bg-emerald-600',
      'Amethyst': 'bg-purple-600',
      'Topaz': 'bg-cyan-400',
    };

    const cartItem = {
      id: Date.now(),
      title: isCustomized
        ? (customName ? `Bespoke Ring - ${customName}` : `Bespoke Ring - Design #${Math.floor(1000 + Math.random() * 9000)}`)
        : product.fullTitle,
      config: {
        setting: isCustomized ? (queryParams.get('setting') || 'Prong') : (product.id === 2 ? 'Halo' : product.id === 3 ? 'Channel' : 'Prong'),
        material: isCustomized ? (queryParams.get('material') || 'Silver') : 'Silver',
        gemstone: isCustomized ? (queryParams.get('gemstone') || 'Diamond') : 'Diamond',
        bandStyle: isCustomized ? (queryParams.get('bandStyle') || 'Plain') : 'Plain',
        width: isCustomized ? parseFloat(queryParams.get('width') || '2.5') : 2.5,
      },
      gemCarat: isCustomized ? parseFloat(queryParams.get('carat') || '2.0') : (parseFloat(product.specs?.['Carat Weight']) || 2.0),
      engraving: isCustomized ? (queryParams.get('engraving') || '') : '',
      engravingFont: isCustomized ? (queryParams.get('font') || 'Script') : 'Script',
      price: isCustomized ? parseInt(queryParams.get('price') || '0', 10) : parseInt(product.price.replace(/[^0-9]/g, '')),
      gemColor: isCustomized
        ? (gemstoneColors[queryParams.get('gemstone') || 'Diamond'] || 'bg-gray-200')
        : 'bg-white/20 shadow-inner border border-white/10',
    };

    const updated = [...cart, cartItem];
    localStorage.setItem('shimori_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    toast.success(`Added ${cartItem.title} to Cart!`, {
      style: { background: '#6A452D', color: '#FFF3E4', fontSize: '11px', fontWeight: 'bold', border: '1px solid rgba(243,214,182,0.25)' }
    });

    setTimeout(() => {
      navigate('/checkout');
    }, 800);
  };

  return (
    <div className="bg-[#5A3925] min-h-screen text-[#FFF3E4]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-6 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: INTERACTIVE 3D VIEWER */}
          <div className="lg:col-span-7">
            <div className="aspect-square bg-[#6B442B] rounded-3xl overflow-hidden group relative shadow-2xl">
              {settingModelUrl && gemModelUrl && (
                <JewelryViewer
                  ringUrl={settingModelUrl}
                  gemUrl={gemModelUrl}
                  materialProps={materialProps}
                  ringWidthScale={widthScale}
                  gemstoneName={activeConfig.gemstone}
                  gemCarat={gemCarat}
                  lightingPreset={activeConfig.lighting}
                  engraving={isCustomized ? (queryParams.get('engraving') || '') : ''}
                  engravingFont={isCustomized ? (queryParams.get('font') || 'Script') : 'Script'}
                  bandStyle={activeConfig.bandStyle}
                />
              )}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <nav className="flex text-[9px] uppercase tracking-[0.15em] text-[#D7A36F] mb-3 gap-2">
              <a className="hover:text-[#F3D6B6]" href="#" onClick={(e) => { e.preventDefault(); navigate('/home'); }}>Home</a>
              <span>/</span>
              <a className="hover:text-[#F3D6B6]" href="#" onClick={(e) => e.preventDefault()}>Engagement Rings</a>
            </nav>

            {isCustomized && (
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D7A36F] to-[#F3D6B6] text-black px-3 py-1 rounded-full text-[8px] uppercase tracking-[0.15em] font-black mb-2 w-fit shadow-md">
                <span className="material-symbols-outlined !text-[9px] animate-pulse">workspace_premium</span>
                Customized
              </div>
            )}

            <h2 className="text-2xl md:text-3xl font-black mb-2 leading-tight tracking-tighter uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
              {isCustomized && customName ? `Bespoke Ring - ${customName}` : product.fullTitle}
            </h2>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex text-[#D7A36F]">
                {[1,2,3,4].map(i => <span key={i} className="material-symbols-outlined !text-xs">star</span>)}
                <span className="material-symbols-outlined !text-xs">star_half</span>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#B99372]">{product.rating} ({product.reviews})</span>
            </div>

            <p className="text-3xl font-light mb-4 text-[#D7A36F] tracking-tighter">
              {isCustomized ? displayPrice : `From ${product.price}`}
            </p>

            <div className="space-y-3 mb-4">
              <p className="text-[#E8C9A8] leading-relaxed text-xs font-medium line-clamp-2">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-y-4 border-y border-[rgba(243,214,182,0.25)] py-4">
                {Object.entries(isCustomized ? customizedSpecs : product.specs).map(([label, value]) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-[0.1em] text-[#B99372] mb-1">{label}</span>
                    <span className="text-[10px] font-black uppercase text-[#FFF3E4]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="space-y-3 mt-auto">
              <div className="flex gap-2">
                <button
                  onClick={addToCart}
                  className="flex-1 bg-gradient-to-r from-[#D7A36F] to-[#F3D6B6] text-black font-black py-3 rounded-xl uppercase tracking-[0.15em] text-[9px] hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">shopping_cart</span>
                  Buy Now
                </button>
                <button
                  onClick={() => toast.success('Added to Wishlist!')}
                  className="p-3 border border-[rgba(243,214,182,0.25)] rounded-xl hover:bg-[#7A5034] transition-colors text-[#E8C9A8]"
                >
                  <span className="material-symbols-outlined text-sm">favorite</span>
                </button>
              </div>
              <button
                onClick={handleCustomize}
                className="w-full bg-[#5A3925] text-[#D7A36F] font-black py-3 rounded-xl uppercase tracking-[0.15em] text-[9px] hover:bg-[#6B442B] transition-all border border-[#D7A36F]"
              >
                Customize with 3D Studio
              </button>
            </div>

            <div className="mt-3 flex items-center gap-3 justify-center lg:justify-start opacity-60">
              <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined !text-sm text-[#D7A36F]">verified</span>
                Lifetime Warranty
              </div>
              <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined !text-sm text-[#D7A36F]">local_shipping</span>
                Secure Delivery
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t border-[rgba(243,214,182,0.12)] mt-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3 text-[8px] font-black uppercase tracking-[0.2em] text-[#B99372]">
          <p>© 2026 SHIMORI FINE JEWELRY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a className="hover:text-[#D7A36F] transition-colors" href="#">Privacy</a>
            <a className="hover:text-[#D7A36F] transition-colors" href="#">Terms</a>
            <a className="hover:text-[#D7A36F] transition-colors" href="#">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;
