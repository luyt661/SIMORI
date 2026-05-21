import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { modelGroups } from '../models';
import JewelryViewer from '../components/JewelryViewer';

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Giá bạc: fetch real-time từ Coinbase (XAG = silver, USD/troy oz)
// Nhẫn bạc ~8g, markup 4x cho fine jewelry craftsmanship
const SILVER_RING_GRAMS = 8;
const SILVER_MARKUP = 4;
const TROY_OZ_TO_GRAMS = 31.1035;
const SILVER_FALLBACK_OZ = 33.0; // fallback nếu API lỗi (USD/oz)

// Giá tĩnh — cập nhật định kỳ theo thị trường
const PRICES = {
  material: {
    'Titan': 1_200,       // industrial titanium + craftsmanship
    'Sắt không gỉ': 550,  // stainless steel + craftsmanship
  },
  gemstone: {
    'Diamond': 10_800,
    'Sapphire': 4_500,
    'Ruby': 5_200,
    'Emerald': 3_800,
    'Amethyst': 1_200,
    'Topaz': 900,
  },
  bandStyle: {
    'Plain': 400,
    'Pavé': 850,
    'Eternity': 1_200,
    'Twisted': 650,
    'Milgrain': 750,
    'Split Shank': 900,
  },
  craftsmanship: 500,
};

const MATERIAL_CONFIGS = {
  'Titan':         { color: [0.20, 0.22, 0.27, 1], metallic: 1.0, roughness: 0.40, displayColor: 'from-[#374151] to-[#6b7280]' },
  'Bạc':           { color: [0.85, 0.85, 0.87, 1], metallic: 1.0, roughness: 0.05, displayColor: 'from-[#cbd5e1] to-[#f8fafc]' },
  'Sắt không gỉ': { color: [0.50, 0.50, 0.52, 1], metallic: 1.0, roughness: 0.20, displayColor: 'from-[#52525b] to-[#a1a1aa]' },
};

const LIGHTING_PRESETS = [
  { id: 'studio', label: 'Luxury Studio', icon: 'wb_sunny', desc: 'Sắc nét, phản chiếu đỉnh cao' },
  { id: 'sunset', label: 'Warm Sunset', icon: 'flare', desc: 'Ấm áp, phản chiếu hoàng hôn vàng' },
  { id: 'warehouse', label: 'Daylight Showroom', icon: 'light_mode', desc: 'Ánh sáng ngoài trời chân thực' },
  { id: 'dawn', label: 'Dawn Glow', icon: 'filter_drama', desc: 'Dịu nhẹ, thanh lịch buổi sớm' }
];

const fallbackSettings = [
  { name: 'Prong', icon: 'diamond' },
  { name: 'Bezel', icon: 'circle' },
  { name: 'Halo', icon: 'wb_sunny' },
  { name: 'Tension', icon: 'unfold_less' },
  { name: 'Channel', icon: 'view_column' },
];
const settings = modelGroups.settings.length
  ? modelGroups.settings.map((m) => ({ name: m.name, icon: 'diamond', url: m.url }))
  : fallbackSettings;

const fallbackMaterials = Object.entries(MATERIAL_CONFIGS).map(([name, cfg]) => ({
  name,
  color: cfg.displayColor,
}));
const materials = modelGroups.materials.length
  ? modelGroups.materials.map((m) => ({ name: m.name, color: 'from-gray-200 to-gray-50', url: m.url }))
  : fallbackMaterials;

const fallbackGemstones = [
  { name: 'Diamond', color: 'bg-white shadow-inner border border-gray-200', label: 'Princess' },
  { name: 'Sapphire', color: 'bg-blue-600', label: 'Round' },
  { name: 'Ruby', color: 'bg-red-600', label: 'Cushion' },
  { name: 'Emerald', color: 'bg-emerald-600', label: 'Pear' },
  { name: 'Amethyst', color: 'bg-purple-600', label: 'Oval' },
  { name: 'Topaz', color: 'bg-cyan-400', label: 'Marquise' },
];
const gemstones = modelGroups.gems.length
  ? modelGroups.gems.map((g) => ({ name: g.name, color: 'bg-gray-200', label: g.name, url: g.url }))
  : fallbackGemstones;

const fallbackBandStyles = ['Plain', 'Pavé', 'Eternity', 'Twisted', 'Milgrain', 'Split Shank'];
const bandStyles = modelGroups.bands.length ? modelGroups.bands.map((b) => b.name) : fallbackBandStyles;

const defaultSetting = settings[0]?.name || 'Prong';

const SidebarSection = ({ title, children, step }) => (
  <section className="mb-10 border-b border-gray-50 pb-8">
    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-5 block">
      {step}. {title}
    </label>
    {children}
  </section>
);

const DesignStudio = () => {
  const navigate = useNavigate();
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [config, setConfig] = useState({
    setting: defaultSetting,
    material: 'Titan',
    gemstone: 'Diamond',
    bandStyle: 'Plain',
    width: 2.5,
  });

  const [gemCarat, setGemCarat] = useState(2.0);
  const [engraving, setEngraving] = useState('');
  const [engravingFont, setEngravingFont] = useState('Script');
  const [lightingPreset, setLightingPreset] = useState('studio');

  // Local collection gallery
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Cart & Checkout
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'shipping' | 'success'
  const [shippingInfo, setShippingInfo] = useState({
    email: '',
    name: '',
    address: '',
    card: '',
    expiry: '',
    cvc: '',
  });

  const [silverPriceOz, setSilverPriceOz] = useState(null);
  const [priceSource, setPriceSource] = useState('loading'); // 'live' | 'estimated'

  // Load URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const settingParam = params.get('setting');
    const materialParam = params.get('material');
    const gemstoneParam = params.get('gemstone');
    const bandStyleParam = params.get('bandStyle');
    const widthParam = params.get('width');
    const caratParam = params.get('carat');
    const engravingParam = params.get('engraving');
    const fontParam = params.get('font');
    const lightingParam = params.get('lighting');

    const newConfig = { ...config };
    let changed = false;

    if (settingParam) {
      const matched = settings.find(s => normalize(s.name) === normalize(settingParam));
      if (matched) { newConfig.setting = matched.name; changed = true; }
    }
    if (materialParam) {
      const matched = materials.find(m => normalize(m.name) === normalize(materialParam));
      if (matched) { newConfig.material = matched.name; changed = true; }
    }
    if (gemstoneParam) {
      const matched = gemstones.find(g => normalize(g.name) === normalize(gemstoneParam));
      if (matched) { newConfig.gemstone = matched.name; changed = true; }
    }
    if (bandStyleParam) {
      const matched = bandStyles.find(b => normalize(b) === normalize(bandStyleParam));
      if (matched) { newConfig.bandStyle = matched; changed = true; }
    }
    if (widthParam) {
      const val = parseFloat(widthParam);
      if (val >= 1.5 && val <= 6.0) { newConfig.width = val; changed = true; }
    }

    if (changed) {
      setConfig(newConfig);
    }

    if (caratParam) {
      const val = parseFloat(caratParam);
      if (val >= 0.5 && val <= 5.0) setGemCarat(val);
    }
    if (engravingParam) {
      setEngraving(engravingParam);
    }
    if (fontParam) {
      if (['Serif', 'Sans', 'Script'].includes(fontParam)) setEngravingFont(fontParam);
    }
    if (lightingParam) {
      if (['studio', 'sunset', 'warehouse', 'dawn'].includes(lightingParam)) setLightingPreset(lightingParam);
    }
  }, []);

  // Fetch silver price
  useEffect(() => {
    axios.get('https://api.coinbase.com/v2/exchange-rates?currency=XAG')
      .then((res) => {
        const usdPerOz = parseFloat(res.data?.data?.rates?.USD);
        if (usdPerOz > 0) {
          setSilverPriceOz(usdPerOz);
          setPriceSource('live');
        } else {
          setSilverPriceOz(SILVER_FALLBACK_OZ);
          setPriceSource('estimated');
        }
      })
      .catch(() => {
        setSilverPriceOz(SILVER_FALLBACK_OZ);
        setPriceSource('estimated');
      });
  }, []);

  // Load localStorage states
  useEffect(() => {
    const rawSaved = localStorage.getItem('shimori_saved_designs');
    if (rawSaved) {
      try { setSavedDesigns(JSON.parse(rawSaved)); } catch(e) {}
    }
    const rawCart = localStorage.getItem('shimori_cart');
    if (rawCart) {
      try { setCart(JSON.parse(rawCart)); } catch(e) {}
    }
  }, []);

  const silverMaterialPrice = useMemo(() => {
    if (!silverPriceOz) return null;
    const weightG = SILVER_RING_GRAMS * (config.width / 2.5);
    return Math.round((silverPriceOz / TROY_OZ_TO_GRAMS) * weightG * SILVER_MARKUP);
  }, [silverPriceOz, config.width]);

  const priceDetails = useMemo(() => {
    const widthMultiplier = config.width / 2.5;
    const baseMatPrice = config.material === 'Bạc'
      ? silverMaterialPrice
      : Math.round((PRICES.material[config.material] ?? 0) * widthMultiplier);
    
    // Scale Gemstone price by Carat weight linearly
    const gemstoneBasePrice = PRICES.gemstone[config.gemstone] ?? 0;
    const scaledGemPrice = Math.round(gemstoneBasePrice * (gemCarat / 2.0));

    const details = [
      { label: 'Base Metal',    value: `${config.material} · ${config.width}mm`,  price: baseMatPrice,                                    isLive: config.material === 'Bạc' && priceSource === 'live' },
      { label: 'Center Stone',  value: `${config.gemstone} · ${gemCarat.toFixed(1)} ct`, price: scaledGemPrice,                                 isLive: false },
      { label: 'Band Style',    value: config.bandStyle,                           price: PRICES.bandStyle[config.bandStyle] ?? 0,         isLive: false },
      { label: 'Craftsmanship', value: 'Handcrafted Artistry',                     price: PRICES.craftsmanship,                            isLive: false },
    ];

    if (engraving) {
      details.push({
        label: 'Custom Engraving',
        value: `"${engraving}" (${engravingFont})`,
        price: 150,
        isLive: false
      });
    }

    return details;
  }, [config, silverMaterialPrice, priceSource, gemCarat, engraving, engravingFont]);

  const totalPrice = useMemo(() =>
    priceDetails.reduce((sum, item) => sum + (item.price ?? 0), 0),
  [priceDetails]);

  const settingModelUrl = useMemo(() => {
    const target = normalize(config.setting);
    const match = modelGroups.settings.find((m) => normalize(m.name) === target || normalize(m.key) === target);
    return match?.url || modelGroups.settings[0]?.url;
  }, [config.setting]);

  const gemModelUrl = useMemo(() => {
    const target = normalize(config.gemstone);
    const match = modelGroups.gems.find((g) => normalize(g.name) === target || normalize(g.key) === target);
    return match?.url || modelGroups.gems[0]?.url;
  }, [config.gemstone]);

  const widthScale = useMemo(() => parseFloat((config.width / 2.5).toFixed(3)), [config.width]);

  const materialProps = useMemo(() => {
    return MATERIAL_CONFIGS[config.material] ?? null;
  }, [config.material]);

  // Copy shareable link
  const copyShareLink = () => {
    const params = new URLSearchParams();
    params.set('setting', config.setting);
    params.set('material', config.material);
    params.set('gemstone', config.gemstone);
    params.set('bandStyle', config.bandStyle);
    params.set('width', config.width.toString());
    params.set('carat', gemCarat.toString());
    if (engraving) {
      params.set('engraving', engraving);
      params.set('font', engravingFont);
    }
    params.set('lighting', lightingPreset);

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast.success('Liên kết thiết kế của bạn đã được sao chép!', {
          style: { background: '#1a1a1a', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
        });
      })
      .catch(() => {
        toast.error('Không thể sao chép liên kết.');
      });
  };

  // Local storage collection handlers
  const saveToCollection = () => {
    const newDesign = {
      id: Date.now(),
      config: { ...config },
      gemCarat,
      engraving,
      engravingFont,
      totalPrice,
      date: new Date().toLocaleDateString('vi-VN'),
    };
    const updated = [newDesign, ...savedDesigns];
    setSavedDesigns(updated);
    localStorage.setItem('shimori_saved_designs', JSON.stringify(updated));
    toast.success('Đã lưu thiết kế vào Bộ sưu tập của bạn!', {
      icon: '💎',
      style: { background: '#1a1a1a', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
    });
  };

  const deleteSavedDesign = (id) => {
    const updated = savedDesigns.filter((d) => d.id !== id);
    setSavedDesigns(updated);
    localStorage.setItem('shimori_saved_designs', JSON.stringify(updated));
    toast.success('Đã xóa thiết kế.');
  };

  const loadSavedDesign = (design) => {
    setConfig(design.config);
    setGemCarat(design.gemCarat);
    setEngraving(design.engraving || '');
    setEngravingFont(design.engravingFont || 'Script');
    setShowSavedModal(false);
    toast.success('Đã tải thiết kế thành công!');
  };

  // Cart & Checkout handlers
  const addItemToCart = () => {
    const cartItem = {
      id: Date.now(),
      title: `Bespoke Ring - Design #${Math.floor(1000 + Math.random() * 9000)}`,
      config: { ...config },
      gemCarat,
      engraving,
      engravingFont,
      price: totalPrice,
      gemColor: gemstones.find(g => g.name === config.gemstone)?.color || 'bg-gray-200',
    };
    const updated = [...cart, cartItem];
    setCart(updated);
    localStorage.setItem('shimori_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    toast.success('Đã thêm nhẫn vào Giỏ hàng!');
    setCheckoutStep('cart');
    setShowCart(true);
  };

  const removeCartItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem('shimori_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!shippingInfo.email || !shippingInfo.name || !shippingInfo.address || !shippingInfo.card) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    setCheckoutStep('success');
    toast.success('Thanh toán thành công! Đơn hàng của bạn đang được chế tác.');
  };

  const clearWholeCart = () => {
    setCart([]);
    localStorage.removeItem('shimori_cart');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="h-screen flex flex-col bg-white font-['Manrope'] overflow-hidden text-[#1a1a1a]">
      <Toaster position="bottom-right" reverseOrder={false} />

      <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-8 shrink-0 z-[130]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-2xl">diamond</span>
          <h2 className="text-xl font-extrabold tracking-tighter uppercase">SHIMORI</h2>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={copyShareLink}
            className="flex items-center gap-1.5 border border-gray-200 px-4 py-2 rounded text-[9px] font-black uppercase tracking-wider hover:bg-gray-50 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">share</span> Share Link
          </button>
          
          <button 
            onClick={() => setShowSavedModal(true)}
            className="flex items-center gap-1.5 border border-gray-200 px-4 py-2 rounded text-[9px] font-black uppercase tracking-wider hover:bg-gray-50 transition-colors relative"
          >
            <span className="material-symbols-outlined text-xs">favorite</span> 
            Collection
            {savedDesigns.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#b08d26] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{savedDesigns.length}</span>
            )}
          </button>

          <button 
            onClick={() => { setCheckoutStep('cart'); setShowCart(true); }}
            className="bg-black text-white px-5 py-2 rounded text-[9px] font-black uppercase tracking-widest hover:bg-[#b08d26] transition-colors flex items-center gap-2 relative"
          >
            <span className="material-symbols-outlined text-xs">shopping_bag</span> 
            Bag
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#facc15] text-black text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <aside className="w-[400px] border-r border-gray-100 bg-white overflow-y-auto no-scrollbar p-8 shrink-0 h-full">
          <div className="mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b08d26] mb-1">Configuration</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Master Piece #4491</p>
          </div>

          <div className="bg-gray-50/80 rounded-xl border border-gray-100 p-6 mb-10">
            <div className="flex items-center gap-2 mb-6 text-[#b08d26]">
              <span className="material-symbols-outlined text-base">description</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Design Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              {Object.entries(config).map(([key, val]) => (
                <div key={key} className="border-l-2 border-gray-200 pl-3">
                  <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">{key}</p>
                  <p className="text-[10px] font-black uppercase">{val} {key === 'width' ? 'mm' : ''}</p>
                </div>
              ))}
              <div className="border-l-2 border-gray-200 pl-3">
                <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Carat Weight</p>
                <p className="text-[10px] font-black uppercase">{gemCarat.toFixed(1)} ct</p>
              </div>
              {engraving && (
                <div className="border-l-2 border-gray-200 pl-3 col-span-2">
                  <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Engraving</p>
                  <p className="text-[10px] font-black uppercase truncate font-serif italic text-amber-800">"{engraving}" ({engravingFont})</p>
                </div>
              )}
            </div>
          </div>

          <SidebarSection step="01" title="Stone Setting">
            <div className="grid grid-cols-3 gap-2">
              {settings.map((s) => (
                <button key={s.name} onClick={() => setConfig({...config, setting: s.name})}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                    config.setting === s.name
                      ? 'border-2 border-[#b08d26] bg-[#b08d26]/12 shadow-md shadow-[#b08d26]/20 scale-[1.03]'
                      : 'border border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  <span className={`material-symbols-outlined text-2xl mb-2 transition-colors ${config.setting === s.name ? 'text-[#b08d26]' : 'text-gray-300'}`}>{s.icon}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${config.setting === s.name ? 'text-[#b08d26]' : 'text-gray-400'}`}>{s.name}</span>
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection step="02" title="Precious Material">
            <div className="space-y-2">
              {materials.map((m) => (
                <button key={m.name} onClick={() => setConfig({...config, material: m.name})}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                    config.material === m.name
                      ? 'border-2 border-[#b08d26] bg-[#b08d26]/12 shadow-md shadow-[#b08d26]/20'
                      : 'border border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${m.color} shadow-sm`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-wide ${config.material === m.name ? 'text-[#b08d26]' : 'text-gray-700'}`}>{m.name}</span>
                  </div>
                  {config.material === m.name
                    ? <span className="material-symbols-outlined text-[#b08d26] text-lg">check_circle</span>
                    : <span className="material-symbols-outlined text-gray-200 text-lg">radio_button_unchecked</span>
                  }
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection step="03" title="Primary Gemstone">
            <div className="flex flex-wrap gap-3">
              {gemstones.map((g) => (
                <button key={g.name} onClick={() => setConfig({...config, gemstone: g.name})}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 ${
                    config.gemstone === g.name
                      ? 'border-2 border-[#b08d26] bg-[#b08d26]/12 shadow-md shadow-[#b08d26]/20 scale-[1.05]'
                      : 'border-2 border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}>
                  <div className={`w-12 h-12 rounded-full ${g.color || 'bg-gray-200'} shadow-sm border border-gray-100`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${config.gemstone === g.name ? 'text-[#b08d26]' : 'text-gray-400'}`}>{g.label}</span>
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection step="04" title="Band Style">
            <div className="grid grid-cols-2 gap-2">
              {bandStyles.map((style) => (
                <button key={style} onClick={() => setConfig({...config, bandStyle: style})}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${
                    config.bandStyle === style
                      ? 'border-2 border-[#b08d26] text-[#b08d26] bg-[#b08d26]/12 shadow-md shadow-[#b08d26]/20'
                      : 'border border-gray-100 text-gray-400 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-600'
                  }`}>
                  {style}
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection step="05" title="Band Width">
            <div className="flex justify-between items-center mb-6 text-[10px] font-bold tracking-widest uppercase">
              <span className="text-gray-400">Width</span>
              <span className="text-[#b08d26]">{config.width} mm</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="6.0"
              step="0.1"
              value={config.width}
              onChange={(e) => setConfig({ ...config, width: parseFloat(e.target.value) })}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#b08d26]"
            />
          </SidebarSection>

          <SidebarSection step="06" title="Gemstone Carats (Size)">
            <div className="flex justify-between items-center mb-6 text-[10px] font-bold tracking-widest uppercase">
              <span className="text-gray-400">Carats</span>
              <span className="text-[#b08d26]">{gemCarat.toFixed(1)} ct</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={gemCarat}
              onChange={(e) => setGemCarat(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#b08d26]"
            />
          </SidebarSection>

          <SidebarSection step="07" title="Personal Engraving">
            <input 
              type="text" 
              placeholder="E.g., FOREVER YOURS (+$150)" 
              maxLength="30"
              value={engraving}
              onChange={(e) => setEngraving(e.target.value.toUpperCase())}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#b08d26] outline-none font-bold uppercase tracking-wider mb-3 text-gray-800 placeholder:text-gray-400"
            />
            {engraving && (
              <div className="flex gap-2 justify-between">
                {['Script', 'Serif', 'Sans'].map(font => (
                  <button 
                    key={font}
                    onClick={() => setEngravingFont(font)}
                    className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg border transition-all ${engravingFont === font ? 'border-[#b08d26] text-[#b08d26] bg-[#b08d26]/5' : 'border-gray-100 text-gray-400'}`}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </SidebarSection>

          <SidebarSection step="08" title="Studio Lighting Environment">
            <div className="grid grid-cols-2 gap-2">
              {LIGHTING_PRESETS.map((p) => (
                <button key={p.id} onClick={() => setLightingPreset(p.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                    lightingPreset === p.id
                      ? 'border-2 border-[#b08d26] bg-[#b08d26]/12 shadow-sm scale-[1.02]'
                      : 'border border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}>
                  <span className={`material-symbols-outlined text-lg mb-1 ${lightingPreset === p.id ? 'text-[#b08d26]' : 'text-gray-300'}`}>{p.icon}</span>
                  <span className={`text-[8px] font-black uppercase tracking-wider ${lightingPreset === p.id ? 'text-[#b08d26]' : 'text-gray-500'}`}>{p.label}</span>
                </button>
              ))}
            </div>
          </SidebarSection>

          <div className="h-40"></div>
        </aside>

        <main className="flex-1 bg-[#fcfcfc] overflow-y-auto no-scrollbar relative flex flex-col h-full">
          <div className="sticky top-8 flex justify-center z-20 pointer-events-none shrink-0">
            <div className="bg-white/90 backdrop-blur px-5 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
               <span className="text-[9px] font-black uppercase tracking-widest">Render: Ultra-High (Physical refraction)</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-[600px] shrink-0">
            <div className="relative group flex flex-col items-center">
              <div style={{ width: 'min(70vw, 900px)', height: 'min(70vw, 600px)' }}>
                <JewelryViewer
                  ringUrl={settingModelUrl}
                  gemUrl={gemModelUrl}
                  materialProps={materialProps}
                  ringWidthScale={parseFloat(widthScale)}
                  gemstoneName={config.gemstone}
                  gemCarat={gemCarat}
                  lightingPreset={lightingPreset}
                />
              </div>
              <div className="mt-8 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100 cursor-pointer">
                  <span className="material-symbols-outlined text-[#b08d26]">open_with</span>
                </div>
                <span className="text-[9px] font-black text-[#b08d26] uppercase">Explore 360°</span>
              </div>
            </div>
          </div>

          <div className="bg-white border-t border-gray-100 px-10 py-8 flex gap-8 shrink-0 overflow-x-auto no-scrollbar">
            <div className="shrink-0 border-r border-gray-100 pr-8 flex flex-col justify-center">
               <p className="text-[9px] font-black text-[#b08d26] uppercase tracking-widest mb-1">Quick Presets</p>
               <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">Faster Switching</p>
            </div>
            <div className="flex gap-4">
              {gemstones.map((gem) => (
                <button key={gem.name} onClick={() => setConfig({...config, gemstone: gem.name})}
                  className={`flex flex-col items-center min-w-[150px] p-5 rounded-xl border transition-all ${config.gemstone === gem.name ? 'border-[#b08d26] bg-gray-50' : 'border-transparent hover:bg-gray-50'}`}>
                  <div className={`w-4 h-4 rotate-45 ${gem.color} border border-gray-200 mb-3`}></div>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-center">{gem.label} {gem.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border-t border-gray-50 py-5 px-10 flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
            <div className="flex gap-8">
              <span className="flex items-center gap-2 text-[#00c853] font-black"><div className="w-1.5 h-1.5 rounded-full bg-[#00c853]"></div> Engine Active</span>
              <span>Metal Density: 21.45 g/cm³</span>
              <span>Refractive Index: {config.gemstone === 'Diamond' ? '2.417' : '1.760'}</span>
            </div>
            <div className="flex gap-6">
              <span className="text-black font-black">Design ID: LUX-882-99</span>
              <span>© 2026 Unified 3D Studio</span>
            </div>
          </div>
          <div className="h-32 shrink-0"></div>
        </main>
      </div>

      {/* PRICE BREAKDOWN BAR & BUY ACTION */}
      <div className="fixed bottom-0 left-0 right-0 z-[120] pointer-events-none">
        <div
          className={`pointer-events-auto bg-white/95 backdrop-blur-xl border-t border-gray-100 px-12 py-12 transition-all duration-500 transform shadow-[0_-30px_60px_rgba(0,0,0,0.12)] ${showPriceBreakdown ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}
          onMouseEnter={() => setShowPriceBreakdown(true)}
          onMouseLeave={() => setShowPriceBreakdown(false)}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-4 gap-16">
            {priceDetails.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                  {item.isLive && (
                    <span className="text-[8px] font-black uppercase tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse inline-block"></span>Live
                    </span>
                  )}
                  {!item.isLive && item.label !== 'Craftsmanship' && (
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Est.</span>
                  )}
                </div>
                <div className="flex justify-between items-end border-b-2 border-gray-100 pb-4">
                  <span className="text-[12px] font-black uppercase text-gray-800 tracking-tight truncate max-w-[150px]">{item.value}</span>
                  <span className="text-[14px] font-black text-[#b08d26]">
                    {item.price == null ? '...' : `$${item.price.toLocaleString()}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto h-24 bg-white border-t border-gray-100 flex items-center justify-between px-12 relative shadow-lg">
          <div className="flex gap-16 items-center">
            <div className="flex flex-col">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-1 flex items-center gap-2"
                 onMouseEnter={() => setShowPriceBreakdown(true)}
                 onMouseLeave={() => setShowPriceBreakdown(false)}>
                Total <span className="material-symbols-outlined text-[13px] text-[#b08d26] cursor-pointer">info</span>
              </p>
              <div className="flex items-baseline gap-4">
                <h3 className="text-2xl font-black tracking-tighter text-black">
                  {priceSource === 'loading' ? '...' : `$${totalPrice.toLocaleString()}`}
                </h3>
                <span className="text-[8px] text-green-600 font-black bg-green-50 px-2 py-1 rounded uppercase tracking-wider">In Stock</span>
              </div>
            </div>

            <button 
              onClick={saveToCollection}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#b08d26] border-b-2 border-[#b08d26] hover:text-black hover:border-black transition-all"
            >
              <span className="material-symbols-outlined text-sm">favorite</span> Save to Collection
            </button>
          </div>

          <button
            onMouseEnter={() => setShowPriceBreakdown(true)}
            onMouseLeave={() => setShowPriceBreakdown(false)}
            onClick={addItemToCart}
            className="bg-[#b08d26] text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4 hover:bg-black transition-all shadow-lg shadow-[#b08d26]/10"
          >
            Add to Bag & Purchase <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* MODAL: SAVED COLLECTIONS */}
      {showSavedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black text-[#b08d26] uppercase tracking-widest">Personal Vault</span>
                <h3 className="text-xl font-black uppercase">My Saved Designs</h3>
              </div>
              <button onClick={() => setShowSavedModal(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
              {savedDesigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">favorite_border</span>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">No Saved Designs Yet</p>
                  <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">Save your custom creation from the customizer footer to easily reload or compare them later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedDesigns.map((d) => (
                    <div key={d.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-[#b08d26] transition-all">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{d.date}</span>
                            <h4 className="text-sm font-black uppercase mt-1">Bespoke Ring #{d.id.toString().slice(-4)}</h4>
                          </div>
                          <span className="text-sm font-black text-[#b08d26]">${d.totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 bg-gray-50/70 p-4 rounded-xl mb-6 text-[9px] uppercase font-bold text-gray-500">
                          <div>Setting: <span className="text-black font-black">{d.config.setting}</span></div>
                          <div>Metal: <span className="text-black font-black">{d.config.material}</span></div>
                          <div>Gemstone: <span className="text-black font-black">{d.config.gemstone}</span></div>
                          <div>Width: <span className="text-black font-black">{d.config.width}mm</span></div>
                          <div>Carat: <span className="text-black font-black">{d.gemCarat.toFixed(1)}ct</span></div>
                          {d.engraving && <div className="col-span-2 truncate">Text: <span className="text-amber-800 font-serif italic">"{d.engraving}"</span></div>}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => loadSavedDesign(d)}
                          className="flex-1 bg-black text-white hover:bg-[#b08d26] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                        >
                          Load Design
                        </button>
                        <button 
                          onClick={() => deleteSavedDesign(d.id)}
                          className="w-12 border border-red-100 hover:border-red-300 hover:bg-red-50 text-red-500 py-3 rounded-xl flex items-center justify-center transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: LUXURY CHECKOUT & CART */}
      <div className={`fixed inset-y-0 right-0 w-[450px] bg-white z-[180] shadow-[0_0_60px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-500 transform ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
        <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b08d26]">shopping_bag</span>
            <h3 className="text-md font-black uppercase tracking-wider">Your Shopping Bag</h3>
            <span className="bg-gray-100 text-gray-700 text-[9px] px-2 py-0.5 rounded-full font-bold ml-2">{cart.length}</span>
          </div>
          <button onClick={() => setShowCart(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* CART STEP CONTENT */}
        {checkoutStep === 'cart' && (
          <div className="flex-1 overflow-y-auto flex flex-col bg-gray-50/50">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-4 font-light">shopping_bag</span>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Your bag is currently empty</p>
                <p className="text-[10px] text-gray-400 mt-2 max-w-xs leading-relaxed">Customize your luxury item and click "Add to Bag" to begin the checkout process.</p>
              </div>
            ) : (
              <div className="flex-1 p-6 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                      <div className={`w-6 h-6 rotate-45 ${item.gemColor} border border-gray-200`}></div>
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <h4 className="text-xs font-black uppercase text-gray-900 truncate mb-1">{item.title}</h4>
                      <div className="text-[8px] uppercase tracking-wide text-gray-400 space-y-0.5">
                        <p>{item.config.setting} setting · {item.config.material} · {item.config.width}mm</p>
                        <p>{item.config.gemstone} · {item.gemCarat.toFixed(1)} ct</p>
                        {item.engraving && <p className="text-amber-800 font-serif italic truncate">Engraved: "{item.engraving}"</p>}
                      </div>
                      <p className="text-xs font-black text-[#b08d26] mt-2">${item.price.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => removeCartItem(item.id)}
                      className="absolute top-4 right-4 w-6 h-6 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* CART FOOTER */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 bg-white p-8 shrink-0 space-y-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Total</span>
                  <span className="text-2xl font-black text-black">
                    ${cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                  </span>
                </div>
                <button 
                  onClick={() => setCheckoutStep('shipping')}
                  className="w-full bg-[#b08d26] text-white hover:bg-black py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#b08d26]/10"
                >
                  Proceed to Checkout <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SHIPPING FORM STEP */}
        {checkoutStep === 'shipping' && (
          <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div>
                <span className="text-[8px] font-black text-[#b08d26] uppercase tracking-widest">Step 2 of 3</span>
                <h4 className="text-md font-black uppercase mt-1">Shipping & Billing</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email Address *</label>
                  <input required type="email" placeholder="client@luxury.com" 
                         value={shippingInfo.email} onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                         className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b08d26] font-bold" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                  <input required type="text" placeholder="ALEXANDRA SMITH" 
                         value={shippingInfo.name} onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value.toUpperCase() })}
                         className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b08d26] font-bold" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Shipping Address *</label>
                  <input required type="text" placeholder="128 FIFTH AVENUE, NEW YORK, NY" 
                         value={shippingInfo.address} onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value.toUpperCase() })}
                         className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b08d26] font-bold" />
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <h5 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-4">Payment Credentials</h5>
                  <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Card Number *</label>
                    <input required type="text" placeholder="4111 2222 3333 4444" 
                           value={shippingInfo.card} onChange={(e) => setShippingInfo({ ...shippingInfo, card: e.target.value })}
                           className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b08d26] font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Expiry *</label>
                      <input required type="text" placeholder="MM/YY" 
                             value={shippingInfo.expiry} onChange={(e) => setShippingInfo({ ...shippingInfo, expiry: e.target.value })}
                             className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b08d26] font-bold text-center" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">CVC *</label>
                      <input required type="text" placeholder="123" 
                             value={shippingInfo.cvc} onChange={(e) => setShippingInfo({ ...shippingInfo, cvc: e.target.value })}
                             className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b08d26] font-bold text-center" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white p-8 shrink-0 flex gap-4">
              <button 
                type="button"
                onClick={() => setCheckoutStep('cart')}
                className="border border-gray-200 hover:bg-gray-50 px-5 py-4 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
              >
                Back
              </button>
              <button 
                type="submit"
                className="flex-1 bg-black text-white hover:bg-[#b08d26] py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg"
              >
                Submit Order & Pay ${cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
              </button>
            </div>
          </form>
        )}

        {/* ORDER SUCCESS STEP */}
        {checkoutStep === 'success' && (
          <div className="flex-1 overflow-y-auto flex flex-col p-8 items-center justify-center text-center bg-white">
            <span className="material-symbols-outlined text-6xl text-green-600 bg-green-50 p-6 rounded-full animate-bounce mb-6">verified</span>
            <span className="text-[9px] font-black text-[#b08d26] uppercase tracking-[0.2em] mb-1">Receipt Confirmed</span>
            <h4 className="text-xl font-black uppercase text-gray-900 mb-3">Masterpiece Order Placed!</h4>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-8">Thank you, <span className="font-bold text-black">{shippingInfo.name}</span>. An invoice receipt has been dispatched to <span className="font-bold text-black">{shippingInfo.email}</span>. Your bespoke jewelry item is officially under craftsmanship.</p>

            <div className="w-full bg-gray-50 border border-gray-100 p-6 rounded-2xl text-[9px] uppercase text-gray-500 font-bold text-left space-y-2 mb-8">
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span>Order Reference:</span>
                <span className="text-black font-black">#SHM-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span>Shipment Destination:</span>
                <span className="text-black font-black truncate max-w-[150px]">{shippingInfo.address}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span>Status:</span>
                <span className="text-amber-800 font-black">Chế tác thủ công</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Paid amount:</span>
                <span className="text-[#b08d26] font-black text-xs">${cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                clearWholeCart();
                setShowCart(false);
              }}
              className="w-full bg-black text-white hover:bg-[#b08d26] py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg"
            >
              Continue Designing
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default DesignStudio;