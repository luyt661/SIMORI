import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { modelGroups } from '../models';
import JewelryViewer from '../components/JewelryViewer';


const normalize = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Silver price: fetch real-time from Coinbase (XAG = silver, USD/troy oz)
// Silver ring ~8g, 4x markup for fine jewelry craftsmanship
const SILVER_RING_GRAMS = 8;
const SILVER_MARKUP = 4;
const TROY_OZ_TO_GRAMS = 31.1035;
const SILVER_FALLBACK_OZ = 33.0; // fallback if API fails (USD/oz)

// Static prices — updated periodically per market
const PRICES = {
  material: {
    'Titanium': 1_200,       // industrial titanium + craftsmanship
    'Titan': 1_200,
    'Stainless Steel': 550,  // stainless steel + craftsmanship
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



const BACKEND_IDS = {
  productId: 1,
  materials: {
    'Titanium': 1,
    'Titan': 1,
    'Silver': 3,
    'Stainless Steel': 1,
  },
  gemstones: {
    'Diamond': 1,
    'Ruby': 2,
    'Sapphire': 3,
    'Emerald': 1,
    'Amethyst': 1,
    'Topaz': 1,
  },
  settings: {
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 1,
    '5': 1,
    'Prong': 1,
    'Bezel': 2,
    'Halo': 3,
    'Tension': 1,
    'Channel': 1,
  },
  bandStyles: {
    'Plain': 1,
    'Pavé': 2,
    'Eternity': 3,
    'Twisted': 1,
    'Milgrain': 1,
    'Split Shank': 1,
  },
  lightingPresets: {
    studio: 1,
    sunset: 1,
    warehouse: 1,
    dawn: 1,
  },
};

const buildDesignPayload = ({ config, designName, gemCarat, engraving, engravingFont, lightingPreset, totalPrice }) => {
  const configJson = {
    setting: config.setting,
    material: config.material,
    gemstone: config.gemstone,
    bandStyle: config.bandStyle,
    width: config.width,
    gemCarat,
    engraving,
    engravingFont,
    lightingPreset,
    designName,
  };
  
  console.log('buildDesignPayload config:', config);
  console.log('buildDesignPayload configJson:', configJson);
  
  return {
    productId: BACKEND_IDS.productId,
    materialId: BACKEND_IDS.materials[config.material] || 1,
    gemstoneId: BACKEND_IDS.gemstones[config.gemstone] || 1,
    settingId: BACKEND_IDS.settings[config.setting] || 1,
    bandStyleId: BACKEND_IDS.bandStyles[config.bandStyle] || 1,
    lightingEnvironmentId: BACKEND_IDS.lightingPresets[lightingPreset] || 1,
    ringSize: '7',
    bandWidth: config.width,
    gemstoneCarat: gemCarat,
    engravingText: engraving || '',
    engravingPrice: engraving ? 150 : 0,
    configurationJson: JSON.stringify(configJson),
    totalPrice,
    previewImageUrl: null,
  };
};

const MATERIAL_CONFIGS = {
  'Titanium':      { color: [0.20, 0.22, 0.27, 1], metallic: 1.0, roughness: 0.40, displayColor: 'from-[#374151] to-[#6b7280]' },
  'Titan':         { color: [0.20, 0.22, 0.27, 1], metallic: 1.0, roughness: 0.40, displayColor: 'from-[#374151] to-[#6b7280]' },
  'Silver':        { color: [0.85, 0.85, 0.87, 1], metallic: 1.0, roughness: 0.05, displayColor: 'from-[#cbd5e1] to-[#f8fafc]' },
  'Stainless Steel': { color: [0.50, 0.50, 0.52, 1], metallic: 1.0, roughness: 0.20, displayColor: 'from-[#52525b] to-[#a1a1aa]' },
};

const LIGHTING_PRESETS = [
  { id: 'studio', label: 'Luxury Studio', icon: 'wb_sunny', desc: 'Sharp, premium reflection' },
  { id: 'sunset', label: 'Warm Sunset', icon: 'flare', desc: 'Warm, golden dusk glow' },
  { id: 'warehouse', label: 'Daylight Showroom', icon: 'light_mode', desc: 'True outdoor daylight' },
  { id: 'dawn', label: 'Dawn Glow', icon: 'filter_drama', desc: 'Soft, elegant morning light' }
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

const fallbackMaterials = Object.entries(MATERIAL_CONFIGS)
  .map(([name, cfg]) => ({ name, color: cfg.displayColor }));
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
  <section className="mb-10 border-b border-[rgba(229,181,117,0.12)] pb-8">
    <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#D8A865] mb-5 block">
      {step}. {title}
    </label>
    {children}
  </section>
);

const DesignStudio = () => {
  const navigate = useNavigate();
  const hasInitialized = useRef(false);
  const [showPreview, setShowPreview] = useState(false);
  const [gemSelected, setGemSelected] = useState(false);
  const [designId, setDesignId] = useState(null);
  const [config, setConfig] = useState({
    setting: defaultSetting,
    material: 'Titanium',
    gemstone: 'Diamond',
    bandStyle: 'Plain',
    width: 2.5,
  });

  const [designName, setDesignName] = useState('Master Piece #4491');
  const [gemCarat, setGemCarat] = useState(2.0);
  const [engraving, setEngraving] = useState('');
  const [engravingInput, setEngravingInput] = useState('');
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
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'

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
    const nameParam = params.get('name');

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
      setEngravingInput(engravingParam);
    }
    if (nameParam) {
      setDesignName(nameParam);
    }
    if (fontParam) {
      if (['Serif', 'Sans', 'Script'].includes(fontParam)) setEngravingFont(fontParam);
    }
    if (lightingParam) {
      if (['studio', 'sunset', 'warehouse', 'dawn'].includes(lightingParam)) setLightingPreset(lightingParam);
    }
    const openCartParam = params.get('openCart');
    if (openCartParam === 'true') {
      setShowCart(true);
      setCheckoutStep('cart');
    }
  }, []);

  // Fetch silver price
  useEffect(() => {
    fetch('https://api.coinbase.com/v2/exchange-rates?currency=XAG')
      .then((res) => res.json())
      .then((data) => {
        const usdPerOz = parseFloat(data?.data?.rates?.USD);

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
    const normalizedMaterial = config.material === 'Bạc' ? 'Silver' : config.material;
    const baseMatPrice = normalizedMaterial === 'Silver'
      ? silverMaterialPrice
      : Math.round((PRICES.material[normalizedMaterial] ?? 0) * widthMultiplier);
    
    // Scale Gemstone price by Carat weight linearly
    const gemstoneBasePrice = PRICES.gemstone[config.gemstone] ?? 0;
    const scaledGemPrice = Math.round(gemstoneBasePrice * (gemCarat / 2.0));

    const details = [
      { label: 'Base Metal',    value: `${config.material} · ${config.width}mm`,  price: baseMatPrice,                                    isLive: (normalizedMaterial === 'Silver') && priceSource === 'live' },
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

  useEffect(() => {
    // Prevent double initialization (especially in React StrictMode dev mode)
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Please log in to save your design.', {
        style: { background: '#896247', color: '#F7E8D2', fontSize: '11px', fontWeight: 'bold' }
      });
      navigate('/login');
      return;
    }

    // Check if URL has designId (continuing from MyDesigns)
    const params = new URLSearchParams(window.location.search);
    const designIdParam = params.get('designId');

    if (designIdParam) {
      // Load existing design from backend
      const loadExistingDesign = async () => {
        try {
          const res = await api.get(`/designs/${designIdParam}`);
          const design = res.data;
          const cfg = JSON.parse(design.configurationJson || '{}');
          
          console.log('Design from backend:', design);
          console.log('Parsed cfg:', cfg);
          console.log('cfg.material:', cfg.material);
          console.log('cfg.setting:', cfg.setting);
          console.log('cfg.width:', cfg.width);
          
          // Load config - keep Stone Setting value compatible with current FE options,
          // but fix Vietnamese material text that may be saved as B?c because of encoding.
          const normalizeLoadedMaterial = (value) => {
            if (!value) return config.material;

            const raw = String(value);
            if (raw === 'B?c' || raw === 'Bac') return 'Silver';

            const matched = materials.find((m) => normalize(m.name) === normalize(raw));
            return matched?.name || config.material;
          };

          const normalizeLoadedSetting = (value) => {
            if (!value) return config.setting;

            const raw = String(value);
            const matched = settings.find((s) => normalize(s.name) === normalize(raw));

            // Important: do NOT convert "2" to "Bezel" here.
            // Your current model options may be named 1,2,3,4,5, so keep that format.
            return matched?.name || raw;
          };

          const normalizeLoadedGemstone = (value) => {
            if (!value) return config.gemstone;
            const raw = String(value);
            const matched = gemstones.find((g) => normalize(g.name) === normalize(raw));
            return matched?.name || config.gemstone;
          };

          const normalizeLoadedBandStyle = (value) => {
            if (!value) return config.bandStyle;
            const raw = String(value);
            const matched = bandStyles.find((b) => normalize(b) === normalize(raw));
            return matched || config.bandStyle;
          };

          const loadedConfig = {
            setting: normalizeLoadedSetting(cfg.setting || design.setting?.name),
            material: normalizeLoadedMaterial(cfg.material || design.material?.name),
            gemstone: normalizeLoadedGemstone(cfg.gemstone || design.gemstone?.name),
            bandStyle: normalizeLoadedBandStyle(cfg.bandStyle || design.bandStyle?.name),
            width: cfg.width !== undefined ? cfg.width : config.width,
          };
          
          console.log('loadedConfig:', loadedConfig);
          
          setConfig(loadedConfig);
          setGemCarat(cfg.gemCarat || 2.0);
          setDesignName(cfg.designName || cfg.name || design.name || 'Master Piece #4491');
          setEngraving(cfg.engraving || '');
          setEngravingInput(cfg.engraving || '');
          setEngravingFont(cfg.engravingFont || 'Script');
          setLightingPreset(cfg.lightingPreset || 'studio');
          
          // Set designId for autosave
          setDesignId(parseInt(designIdParam));
          setAutoSaveStatus('idle');
          
          // Clean up URL (remove designId param from history)
          window.history.replaceState({}, document.title, `/design?designId=${designIdParam}`);
          
          console.log('Loaded existing design:', designIdParam);
          toast.success('Design resumed successfully!', {
            style: { background: '#896247', color: '#F7E8D2', fontSize: '11px', fontWeight: 'bold' }
          });
        } catch (err) {
          console.error('Load design failed:', err);
          toast.error('Could not load design, creating new draft.', {
            style: { background: '#896247', color: '#F7E8D2', fontSize: '11px', fontWeight: 'bold' }
          });
          // Do not create a new draft here. Continue must keep using the existing designId.
        }
      };
      loadExistingDesign();
      return;
    }

    // No designId in URL, create new draft
    const createNewDraft = async () => {
      try {
        const payload = buildDesignPayload({
          config,
          designName,
          gemCarat,
          engraving,
          engravingFont,
          lightingPreset,
          totalPrice,
        });

        const res = await api.post('/designs', payload);
        setDesignId(res.data.id);
        setAutoSaveStatus('idle');
        console.log('Draft created:', res.data.id);
      } catch (err) {
        console.error('Create draft failed:', err);
        toast.error('Could not create design draft.', {
          style: { background: '#896247', color: '#F7E8D2', fontSize: '11px', fontWeight: 'bold' }
        });
      }
    };

    createNewDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!designId) return;

    setAutoSaveStatus('saving');
    const timeout = setTimeout(async () => {
      try {
        const payload = buildDesignPayload({
          config,
          designName,
          gemCarat,
          engraving,
          engravingFont,
          lightingPreset,
          totalPrice,
        });

        await api.patch(`/designs/${designId}`, payload);
        console.log('Autosaved design:', designId);
        setAutoSaveStatus('saved');
        
        // Revert to idle after 2 seconds
        const revertTimeout = setTimeout(() => setAutoSaveStatus('idle'), 2000);
        return () => clearTimeout(revertTimeout);
      } catch (err) {
        console.error('Autosave failed:', err);
        setAutoSaveStatus('idle');
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [config, designName, gemCarat, engraving, engravingFont, lightingPreset, totalPrice, designId]);

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
    params.set('name', designName);
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
        toast.success('Your design link has been copied!', {
          style: { background: '#896247', color: '#F7E8D2', fontSize: '11px', fontWeight: 'bold' }
        });
      })
      .catch(() => {
        toast.error('Could not copy link.');
      });
  };

  // Local storage collection handlers
  const saveToCollection = async () => {
    if (!designId) {
      toast.error('Draft not ready yet, please try again.');
      return;
    }

    try {
      const payload = buildDesignPayload({
        config,
        designName,
        gemCarat,
        engraving,
        engravingFont,
        lightingPreset,
        totalPrice,
      });

      await api.patch(`/designs/${designId}`, payload);

      const newDesign = {
        id: designId,
        name: designName,
        config: { ...config },
        gemCarat,
        engraving,
        engravingFont,
        lightingPreset,
        totalPrice,
        date: new Date().toLocaleDateString('en-US'),
      };

      const updated = [newDesign, ...savedDesigns.filter((d) => d.id !== designId)];
      setSavedDesigns(updated);
      localStorage.setItem('shimori_saved_designs', JSON.stringify(updated));

      toast.success('Design saved to backend & collection!', {
        icon: '💎',
        style: { background: '#896247', color: '#F7E8D2', fontSize: '11px', fontWeight: 'bold' }
      });
    } catch (err) {
      console.error('Save design failed:', err);
      toast.error('Failed to save design.');
    }
  };

  const deleteSavedDesign = (id) => {
    const updated = savedDesigns.filter((d) => d.id !== id);
    setSavedDesigns(updated);
    localStorage.setItem('shimori_saved_designs', JSON.stringify(updated));
    toast.success('Design deleted.');
  };

  const loadSavedDesign = (design) => {
    setConfig(design.config);
    setGemCarat(design.gemCarat);
    setDesignName(design.name || 'Master Piece #4491');
    setEngraving(design.engraving || '');
    setEngravingInput(design.engraving || '');
    setEngravingFont(design.engravingFont || 'Script');
    setLightingPreset(design.lightingPreset || 'studio');
    setDesignId(design.id); // Update designId so autosave patches this design
    setShowSavedModal(false);
    setAutoSaveStatus('idle');
    toast.success('Design loaded successfully!');
  };

  // Cart & Checkout handlers
  const addItemToCart = () => {
    const cartItem = {
      id: Date.now(),
      title: designName ? `Bespoke Ring - ${designName}` : `Bespoke Ring - Design #${Math.floor(1000 + Math.random() * 9000)}`,
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
    toast.success('Ring added to bag!');
    setCheckoutStep('cart');
    setShowCart(true);
  };

  const proceedToProductDetail = () => {
    const params = new URLSearchParams();
    params.set('name', designName);
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
    params.set('price', totalPrice.toString());
    params.set('customized', 'true');
    
    let productId = 1;
    if (config.setting === 'Halo') productId = 2;
    else if (config.setting === 'Channel') productId = 3;

    navigate(`/product-detail/${productId}?${params.toString()}`);
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
      toast.error('Please fill in all required fields.');
      return;
    }
    setCheckoutStep('success');
    toast.success('Payment successful! Your order is now being crafted.');
  };

  const clearWholeCart = () => {
    setCart([]);
    localStorage.removeItem('shimori_cart');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="min-h-dvh lg:h-dvh flex flex-col bg-[#6B4933] font-['Manrope'] overflow-x-hidden lg:overflow-hidden text-[#F7E8D2]">
      <Toaster position="bottom-right" reverseOrder={false} />

      <header className="min-h-16 border-b border-[rgba(229,181,117,0.15)] bg-[#79543B] backdrop-blur flex items-center justify-between gap-3 px-3 py-2 sm:px-5 lg:px-8 shrink-0 z-[130]">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="cursor-pointer" onClick={() => navigate('/home')}>
            <span className="material-symbols-outlined text-2xl text-[#F3E4CF]">diamond</span>
            <h2 className="text-xl font-extrabold tracking-tighter uppercase text-[#F3E4CF]">SHIMORI</h2>
          </div>
          {autoSaveStatus !== 'idle' && (
            <div className={`hidden sm:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full transition-all ${
              autoSaveStatus === 'saving' 
                ? 'bg-[#957052] text-[#D8A865]' 
                : 'bg-[#1a3a1a] text-[#4caf50]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${autoSaveStatus === 'saving' ? 'bg-[#D8A865]' : 'bg-[#4caf50]'}`}></span>
              {autoSaveStatus === 'saving' ? 'Saving...' : 'Saved!'}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3 lg:gap-6">
          <button 
            onClick={copyShareLink}
            className="hidden sm:flex items-center gap-1.5 border border-[rgba(229,181,117,0.25)] px-3 lg:px-4 py-2 rounded text-[9px] font-black uppercase tracking-wider text-[#F3E4CF] hover:bg-[#957052] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">share</span>
            <span className="hidden lg:inline">Share Link</span>
          </button>
          
          <button 
            onClick={() => setShowSavedModal(true)}
            className="hidden md:flex items-center gap-1.5 border border-[rgba(229,181,117,0.25)] px-3 lg:px-4 py-2 rounded text-[9px] font-black uppercase tracking-wider text-[#F3E4CF] hover:bg-[#957052] transition-colors relative"
          >
            <span className="material-symbols-outlined text-sm">favorite</span>
            <span className="hidden lg:inline">Collection</span>
            {savedDesigns.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#D8A865] text-[#1a0f06] text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{savedDesigns.length}</span>
            )}
          </button>

          <button 
            onClick={() => { setCheckoutStep('cart'); setShowCart(true); }}
            className="bg-[#D8A865] text-[#1a0f06] h-10 px-3 lg:px-5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-[#B87948] transition-colors flex items-center gap-2 relative"
          >
            <span className="material-symbols-outlined text-sm">shopping_bag</span>
            <span className="hidden sm:inline">Bag</span>
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#D8A865] text-[#1a0f06] text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>
            )}
          </button>

          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('shimori_cart');
              localStorage.removeItem('shimori_saved_designs');
              toast.success('Logged out!', {
                style: { background: '#896247', color: '#F7E8D2', fontSize: '11px', fontWeight: 'bold' }
              });
              navigate('/login');
            }}
            className="flex h-10 items-center gap-1 border border-red-900/30 text-red-400 px-3 lg:px-4 rounded text-[9px] font-black uppercase tracking-wider hover:bg-red-950/20 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0 pb-36 lg:pb-24">
        <aside className="order-2 lg:order-1 w-full lg:w-[400px] border-t lg:border-t-0 lg:border-r border-[rgba(229,181,117,0.15)] bg-[#79543B] overflow-visible lg:overflow-y-auto no-scrollbar p-4 sm:p-6 lg:p-8 shrink-0 h-auto lg:h-full">
          <div className="mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D8A865] mb-1.5">Design Name</h2>
            <div className="relative group/name max-w-xs">
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                placeholder="Name your design..."
                className="w-full bg-[#957052] hover:bg-[#7C5438]/70 border border-[rgba(229,181,117,0.15)] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#D8A865] focus:bg-[#7C5438] font-black uppercase tracking-wider text-[#F7E8D2] placeholder:text-[#B99372] placeholder:font-bold transition-all"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#B99372] group-focus-within/name:text-[#D8A865] text-sm pointer-events-none transition-colors">edit</span>
            </div>
          </div>

          <div className="bg-[#957052]/80 rounded-xl border border-[rgba(229,181,117,0.15)] p-6 mb-10">
            <div className="flex items-center gap-2 mb-6 text-[#D8A865]">
              <span className="material-symbols-outlined text-base">description</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Design Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              {Object.entries(config).map(([key, val]) => (
                <div key={key} className="border-l-2 border-[rgba(229,181,117,0.15)] pl-3">
                  <p className="text-[8px] font-bold text-[#B99372] uppercase mb-1">{key}</p>
                  <p className="text-[10px] font-black uppercase text-[#F7E8D2]">{val} {key === 'width' ? 'mm' : ''}</p>
                </div>
              ))}
              <div className="border-l-2 border-[rgba(229,181,117,0.15)] pl-3">
                <p className="text-[8px] font-bold text-[#B99372] uppercase mb-1">Carat Weight</p>
                <p className="text-[10px] font-black uppercase text-[#F7E8D2]">{gemCarat.toFixed(1)} ct</p>
              </div>
              {engraving && (
                <div className="border-l-2 border-[rgba(229,181,117,0.15)] pl-3 col-span-2">
                  <p className="text-[8px] font-bold text-[#B99372] uppercase mb-1">Engraving</p>
                  <p className="text-[10px] font-black uppercase truncate font-serif italic text-amber-800">"{engraving}" ({engravingFont})</p>
                </div>
              )}
            </div>
          </div>

          <SidebarSection step="01" title="Stone Setting">
            <div className="grid grid-cols-3 gap-2">
              {settings.map((s) => (
                <button key={s.name} onClick={() => { setConfig({...config, setting: s.name}); setShowPreview(true); }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                    config.setting === s.name
                      ? 'border-2 border-[#D8A865] bg-[#D8A865]/12 shadow-md shadow-[#D8A865]/20 scale-[1.03]'
                      : 'border border-[rgba(229,181,117,0.15)] hover:border-[rgba(229,181,117,0.3)] hover:bg-[#957052]'
                  }`}>
                  <span className={`material-symbols-outlined text-2xl mb-2 transition-colors ${config.setting === s.name ? 'text-[#D8A865]' : 'text-[#B99372]'}`}>{s.icon}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${config.setting === s.name ? 'text-[#D8A865]' : 'text-[#B99372]'}`}>{s.name}</span>
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection step="02" title="Precious Material">
            <div className="space-y-2">
              {materials.map((m) => (
                <button key={m.name} onClick={() => { setConfig({...config, material: m.name}); setShowPreview(true); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                    config.material === m.name
                      ? 'border-2 border-[#D8A865] bg-[#D8A865]/12 shadow-md shadow-[#D8A865]/20'
                      : 'border border-[rgba(229,181,117,0.15)] hover:border-[rgba(229,181,117,0.3)] hover:bg-[#957052]'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${m.color} shadow-sm`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-wide ${config.material === m.name ? 'text-[#D8A865]' : 'text-[#D9BFA0]'}`}>{m.name}</span>
                  </div>
                  {config.material === m.name
                    ? <span className="material-symbols-outlined text-[#D8A865] text-lg">check_circle</span>
                    : <span className="material-symbols-outlined text-[rgba(229,181,117,0.15)] text-lg">radio_button_unchecked</span>
                  }
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection step="03" title="Primary Gemstone">
            <div className="flex flex-wrap gap-3">
              {gemstones.map((g) => (
                <button key={g.name} onClick={() => { setConfig({...config, gemstone: g.name}); setGemSelected(true); setShowPreview(true); }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 ${
                    config.gemstone === g.name
                      ? 'border-2 border-[#D8A865] bg-[#D8A865]/12 shadow-md shadow-[#D8A865]/20 scale-[1.05]'
                      : 'border-2 border-transparent hover:border-[rgba(229,181,117,0.3)] hover:bg-[#957052]'
                  }`}>
                  <div className={`w-12 h-12 rounded-full ${g.color || 'bg-gray-200'} shadow-sm border border-[rgba(229,181,117,0.15)]`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${config.gemstone === g.name ? 'text-[#D8A865]' : 'text-[#B99372]'}`}>{g.label}</span>
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection step="04" title="Band Style">
            <div className="grid grid-cols-2 gap-2">
              {bandStyles.map((style) => (
                <button key={style} onClick={() => { setConfig({...config, bandStyle: style}); setShowPreview(true); }}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${
                    config.bandStyle === style
                      ? 'border-2 border-[#D8A865] text-[#D8A865] bg-[#D8A865]/12 shadow-md shadow-[#D8A865]/20'
                      : 'border border-[rgba(229,181,117,0.15)] text-[#B99372] hover:border-[rgba(229,181,117,0.3)] hover:bg-[#957052] hover:text-[#D9BFA0]'
                  }`}>
                  {style}
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection step="05" title="Band Width">
            <div className="flex justify-between items-center mb-6 text-[10px] font-bold tracking-widest uppercase">
              <span className="text-[#B99372]">Width</span>
              <span className="text-[#D8A865]">{config.width} mm</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="6.0"
              step="0.1"
              value={config.width}
              onChange={(e) => setConfig({ ...config, width: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#957052] rounded-lg appearance-none cursor-pointer accent-[#D8A865]"
            />
          </SidebarSection>

          <SidebarSection step="06" title="Gemstone Carats (Size)">
            <div className="flex justify-between items-center mb-6 text-[10px] font-bold tracking-widest uppercase">
              <span className="text-[#B99372]">Carats</span>
              <span className="text-[#D8A865]">{gemCarat.toFixed(1)} ct</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={gemCarat}
              onChange={(e) => setGemCarat(parseFloat(e.target.value))}
              className="w-full h-1 bg-[#957052] rounded-lg appearance-none cursor-pointer accent-[#D8A865]"
            />
          </SidebarSection>

          <SidebarSection step="07" title="Personal Engraving">
            <div className="flex gap-2 mb-3">
              <input 
                type="text" 
                placeholder="E.g., FOREVER YOURS (+$150)" 
                maxLength="30"
                value={engravingInput}
                onChange={(e) => setEngravingInput(e.target.value.toUpperCase())}
                className="flex-1 bg-[#957052] border border-[rgba(229,181,117,0.15)] rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#D8A865] outline-none font-bold uppercase tracking-wider text-[#F7E8D2] placeholder:text-[#B99372]"
              />
              <button
                onClick={() => {
                  setEngraving(engravingInput);
                  toast.success('Engraving applied!');
                }}
                className={`p-3 rounded-xl border transition-all flex items-center justify-center ${engravingInput !== engraving ? 'bg-[#D8A865] text-[#1a0f06] border-[#D8A865] hover:bg-[#D8A865]/90 shadow-sm' : 'bg-[#957052] text-[#B99372] border-[rgba(229,181,117,0.15)]'}`}
                title="Engrave Ring"
              >
                <span className="material-symbols-outlined text-lg">publish</span>
              </button>
            </div>
            {engravingInput && (
              <div className="flex gap-2 justify-between">
                {['Script', 'Serif', 'Sans'].map(font => (
                  <button 
                    key={font}
                    onClick={() => setEngravingFont(font)}
                    className={`flex-1 py-2 text-[8px] font-black uppercase rounded-lg border transition-all ${engravingFont === font ? 'border-[#D8A865] text-[#D8A865] bg-[#D8A865]/5' : 'border-[rgba(229,181,117,0.15)] text-[#B99372]'}`}
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
                      ? 'border-2 border-[#D8A865] bg-[#D8A865]/12 shadow-sm scale-[1.02]'
                      : 'border border-[rgba(229,181,117,0.15)] hover:border-[rgba(229,181,117,0.3)] hover:bg-[#957052]'
                  }`}>
                  <span className={`material-symbols-outlined text-lg mb-1 ${lightingPreset === p.id ? 'text-[#D8A865]' : 'text-[#B99372]'}`}>{p.icon}</span>
                  <span className={`text-[8px] font-black uppercase tracking-wider ${lightingPreset === p.id ? 'text-[#D8A865]' : 'text-[#B99372]'}`}>{p.label}</span>
                </button>
              ))}
            </div>
          </SidebarSection>

          <div className="h-6 lg:h-40"></div>
        </aside>

        <main className="order-1 lg:order-2 w-full flex-none lg:flex-1 bg-gradient-to-b from-[#17130F] to-[#272019] overflow-visible lg:overflow-y-auto no-scrollbar relative flex flex-col h-auto lg:h-full">
          <div className="sticky top-3 lg:top-8 flex justify-center z-20 pointer-events-none shrink-0 px-3">
            <div className="bg-[#79543B]/90 backdrop-blur px-5 py-2 rounded-full border border-[rgba(229,181,117,0.15)] shadow-sm flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
               <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wide sm:tracking-widest text-[#D9BFA0] text-center">
                 Render: Ultra-High
                 <span className="hidden sm:inline"> (Physical refraction)</span>
               </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-3 sm:p-6 lg:p-10 min-h-[380px] sm:min-h-[520px] lg:min-h-[600px] shrink-0">
            <div className="relative group flex w-full flex-col items-center">
              <div className="w-full max-w-[900px] h-[340px] sm:h-[480px] lg:h-[600px] border border-[rgba(229,181,117,0.1)] shadow-2xl shadow-black/30">
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
              <div className="mt-2 sm:mt-6 lg:mt-8 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#896247] shadow-md flex items-center justify-center border border-[rgba(229,181,117,0.15)] cursor-pointer">
                  <span className="material-symbols-outlined text-[#D8A865]">open_with</span>
                </div>
                <span className="text-[9px] font-black text-[#D8A865] uppercase">Explore 360°</span>
              </div>
            </div>
          </div>

          <div className="bg-[#896247] border-t border-[rgba(229,181,117,0.15)] px-4 sm:px-6 lg:px-10 py-5 lg:py-8 flex gap-4 lg:gap-8 shrink-0 overflow-x-auto no-scrollbar">
            <div className="hidden sm:flex shrink-0 border-r border-[rgba(229,181,117,0.15)] pr-6 lg:pr-8 flex-col justify-center">
               <p className="text-[9px] font-black text-[#D8A865] uppercase tracking-widest mb-1">Quick Presets</p>
               <p className="text-[8px] text-[#B99372] font-bold uppercase tracking-tight">Faster Switching</p>
            </div>
            <div className="flex gap-4">
              {gemstones.map((gem) => (
                <button key={gem.name} onClick={() => setConfig({...config, gemstone: gem.name})}
                  className={`flex flex-col items-center min-w-[110px] sm:min-w-[150px] p-3 sm:p-5 rounded-xl border transition-all ${config.gemstone === gem.name ? 'border-[#D8A865] bg-[#957052]' : 'border-transparent hover:bg-[#957052]'}`}>
                  <div className={`w-4 h-4 rotate-45 ${gem.color} border border-[rgba(229,181,117,0.15)] mb-3`}></div>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-[#D9BFA0] text-center">{gem.label} {gem.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex bg-[#79543B] border-t border-[rgba(229,181,117,0.12)] py-5 px-10 items-center justify-between text-[9px] font-bold text-[#B99372] uppercase tracking-widest shrink-0">
            <div className="flex gap-8">
              <span className="flex items-center gap-2 text-[#00c853] font-black"><div className="w-1.5 h-1.5 rounded-full bg-[#00c853]"></div> Engine Active</span>
              <span>Metal Density: 21.45 g/cm³</span>
              <span>Refractive Index: {config.gemstone === 'Diamond' ? '2.417' : '1.760'}</span>
            </div>
            <div className="flex gap-6">
              <span className="text-[#F7E8D2] font-black">Design ID: {designId ? `#${designId}` : 'Creating...'}</span>
              <span>© 2026 Unified 3D Studio</span>
            </div>
          </div>
          <div className="h-4 lg:h-32 shrink-0"></div>
        </main>
      </div>

      {/* BUY ACTION */}
      <div className="fixed bottom-0 left-0 right-0 z-[120] pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between gap-3 bg-[#79543B] border-t border-[rgba(229,181,117,0.15)] px-3 py-3 sm:px-6 lg:px-12 lg:h-24 relative shadow-lg safe-bottom">
          <div className="flex items-center gap-3">
            <button 
              onClick={saveToCollection}
              className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D8A865] border-b-2 border-[#D8A865] hover:text-[#F7E8D2] hover:border-[#F7E8D2] transition-all"
            >
              <span className="material-symbols-outlined text-sm">favorite</span> Save to Collection
            </button>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2 sm:gap-4 lg:flex">
            <button
              onClick={addItemToCart}
              className="bg-[#896247] text-[#F7E8D2] border border-[rgba(229,181,117,0.3)] px-3 sm:px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-black uppercase text-[8px] sm:text-[10px] tracking-wider lg:tracking-[0.3em] hover:bg-[#D8A865] hover:text-[#1a0f06] transition-all"
            >
              Add To Bag
            </button>

            <button
              onClick={proceedToProductDetail}
              className="bg-gradient-to-r from-[#D8A865] to-[#E5B575] text-[#1a0f06] px-3 sm:px-6 lg:px-10 py-3 lg:py-4 rounded-xl font-black uppercase text-[8px] sm:text-[10px] tracking-wider lg:tracking-[0.3em] flex items-center justify-center gap-2 lg:gap-4 hover:from-[#E5B575] hover:to-[#D8A865] transition-all shadow-lg shadow-black/15"
            >
              <span className="sm:hidden">Buy Now</span>
              <span className="hidden sm:inline">Detail</span>
              <span className="material-symbols-outlined text-sm lg:text-base">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: SAVED COLLECTIONS */}
      {showSavedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-[#896247] rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-[rgba(229,181,117,0.15)] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black text-[#D8A865] uppercase tracking-widest">Personal Vault</span>
                <h3 className="text-xl font-black uppercase text-[#F7E8D2]">My Saved Designs</h3>
              </div>
              <button onClick={() => setShowSavedModal(false)} className="w-10 h-10 rounded-full hover:bg-[#957052] flex items-center justify-center transition-colors text-[#D9BFA0]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#957052]/50">
              {savedDesigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="material-symbols-outlined text-5xl text-[#B99372] mb-4">favorite_border</span>
                  <p className="text-sm font-bold text-[#B99372] uppercase tracking-wider">No Saved Designs Yet</p>
                  <p className="text-xs text-[#B99372] mt-2 max-w-xs leading-relaxed">Save your custom creation from the customizer footer to easily reload or compare them later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedDesigns.map((d) => (
                    <div key={d.id} className="bg-[#957052] p-4 sm:p-6 rounded-2xl border border-[rgba(229,181,117,0.15)] shadow-sm flex flex-col justify-between group hover:border-[#D8A865] transition-all">
                      <div>
                        <div className="mb-4">
                          <span className="text-[8px] font-black text-[#B99372] uppercase tracking-widest">{d.date}</span>
                          <h4 className="text-sm font-black uppercase text-[#F7E8D2] mt-1">Bespoke Ring #{d.id.toString().slice(-4)}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 bg-[#896247]/70 p-4 rounded-xl mb-6 text-[9px] uppercase font-bold text-[#B99372]">
                          <div>Setting: <span className="text-[#F7E8D2] font-black">{d.config.setting}</span></div>
                          <div>Metal: <span className="text-[#F7E8D2] font-black">{d.config.material}</span></div>
                          <div>Gemstone: <span className="text-[#F7E8D2] font-black">{d.config.gemstone}</span></div>
                          <div>Width: <span className="text-[#F7E8D2] font-black">{d.config.width}mm</span></div>
                          <div>Carat: <span className="text-[#F7E8D2] font-black">{d.gemCarat.toFixed(1)}ct</span></div>
                          {d.engraving && <div className="col-span-2 truncate">Text: <span className="text-amber-800 font-serif italic">"{d.engraving}"</span></div>}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => loadSavedDesign(d)}
                          className="flex-1 bg-[#D8A865] text-[#1a0f06] hover:bg-[#B87948] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                        >
                          Load Design
                        </button>
                        <button 
                          onClick={() => deleteSavedDesign(d.id)}
                          className="w-12 border border-red-900/20 hover:border-red-500/50 hover:bg-red-950/20 text-red-400 py-3 rounded-xl flex items-center justify-center transition-all"
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
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] max-w-full bg-[#79543B] z-[180] shadow-[0_0_60px_rgba(0,0,0,0.5)] flex flex-col transition-transform duration-500 transform ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
        <header className="px-4 sm:px-8 py-4 sm:py-6 border-b border-[rgba(229,181,117,0.15)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D8A865]">shopping_bag</span>
            <h3 className="text-md font-black uppercase tracking-wider text-[#F7E8D2]">Your Shopping Bag</h3>
            <span className="bg-[#957052] text-[#D9BFA0] text-[9px] px-2 py-0.5 rounded-full font-bold ml-2">{cart.length}</span>
          </div>
          <button onClick={() => setShowCart(false)} className="w-10 h-10 rounded-full hover:bg-[#957052] flex items-center justify-center transition-colors text-[#D9BFA0]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* CART STEP CONTENT */}
        {checkoutStep === 'cart' && (
          <div className="flex-1 overflow-y-auto flex flex-col bg-[#6B4933]/50">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center">
                <span className="material-symbols-outlined text-4xl text-[#B99372] mb-4 font-light">shopping_bag</span>
                <p className="text-xs font-black uppercase tracking-widest text-[#B99372]">Your bag is currently empty</p>
                <p className="text-[10px] text-[#B99372] mt-2 max-w-xs leading-relaxed">Customize your luxury item and click "Add to Bag" to begin the checkout process.</p>
              </div>
            ) : (
              <div className="flex-1 p-4 sm:p-6 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-[#957052] p-5 rounded-2xl border border-[rgba(229,181,117,0.15)] shadow-sm relative group flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#957052] flex items-center justify-center shrink-0 border border-[rgba(229,181,117,0.15)]">
                      <div className={`w-6 h-6 rotate-45 ${item.gemColor} border border-[rgba(229,181,117,0.15)]`}></div>
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <h4 className="text-xs font-black uppercase text-[#F7E8D2] truncate mb-1">{item.title}</h4>
                      <div className="text-[8px] uppercase tracking-wide text-[#B99372] space-y-0.5">
                        <p>{item.config.setting} setting · {item.config.material} · {item.config.width}mm</p>
                        <p>{item.config.gemstone} · {item.gemCarat.toFixed(1)} ct</p>
                        {item.engraving && <p className="text-amber-800 font-serif italic truncate">Engraved: "{item.engraving}"</p>}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeCartItem(item.id)}
                      className="absolute top-4 right-4 w-6 h-6 rounded-full hover:bg-red-950/20 text-[#B99372] hover:text-red-400 flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* CART FOOTER */}
            {cart.length > 0 && (
              <div className="border-t border-[rgba(229,181,117,0.15)] bg-[#896247] p-4 sm:p-8 shrink-0 safe-bottom">
                <button 
                  onClick={() => setCheckoutStep('shipping')}
                  className="w-full bg-[#D8A865] text-[#1a0f06] hover:bg-[#B87948] py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#D8A865]/10"
                >
                  Proceed to Checkout <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SHIPPING FORM STEP */}
        {checkoutStep === 'shipping' && (
          <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col overflow-hidden bg-[#79543B]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
              <div>
                <span className="text-[8px] font-black text-[#D8A865] uppercase tracking-widest">Step 2 of 3</span>
                <h4 className="text-md font-black uppercase text-[#F7E8D2] mt-1">Shipping & Billing</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">Email Address *</label>
                  <input required type="email" placeholder="client@luxury.com" 
                         value={shippingInfo.email} onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                         className="w-full border border-[rgba(229,181,117,0.15)] bg-[#957052]/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D8A865] font-bold text-[#F7E8D2] placeholder:text-[#B99372]" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">Full Name *</label>
                  <input required type="text" placeholder="ALEXANDRA SMITH" 
                         value={shippingInfo.name} onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value.toUpperCase() })}
                         className="w-full border border-[rgba(229,181,117,0.15)] bg-[#957052]/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D8A865] font-bold text-[#F7E8D2] placeholder:text-[#B99372]" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">Shipping Address *</label>
                  <input required type="text" placeholder="128 FIFTH AVENUE, NEW YORK, NY" 
                         value={shippingInfo.address} onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value.toUpperCase() })}
                         className="w-full border border-[rgba(229,181,117,0.15)] bg-[#957052]/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D8A865] font-bold text-[#F7E8D2] placeholder:text-[#B99372]" />
                </div>
                
                <div className="border-t border-[rgba(229,181,117,0.15)] pt-6">
                  <h5 className="text-[9px] font-black uppercase tracking-widest text-[#B99372] mb-4">Payment Credentials</h5>
                  <div>
                    <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">Card Number *</label>
                    <input required type="text" placeholder="4111 2222 3333 4444" 
                           value={shippingInfo.card} onChange={(e) => setShippingInfo({ ...shippingInfo, card: e.target.value })}
                           className="w-full border border-[rgba(229,181,117,0.15)] bg-[#957052]/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D8A865] font-bold text-[#F7E8D2] placeholder:text-[#B99372]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">Expiry *</label>
                      <input required type="text" placeholder="MM/YY" 
                             value={shippingInfo.expiry} onChange={(e) => setShippingInfo({ ...shippingInfo, expiry: e.target.value })}
                             className="w-full border border-[rgba(229,181,117,0.15)] bg-[#957052]/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D8A865] font-bold text-[#F7E8D2] placeholder:text-[#B99372] text-center" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">CVC *</label>
                      <input required type="text" placeholder="123" 
                             value={shippingInfo.cvc} onChange={(e) => setShippingInfo({ ...shippingInfo, cvc: e.target.value })}
                             className="w-full border border-[rgba(229,181,117,0.15)] bg-[#957052]/50 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D8A865] font-bold text-[#F7E8D2] placeholder:text-[#B99372] text-center" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[rgba(229,181,117,0.15)] bg-[#896247] p-4 sm:p-8 shrink-0 flex gap-2 sm:gap-4 safe-bottom">
              <button 
                type="button"
                onClick={() => setCheckoutStep('cart')}
                className="border border-[rgba(229,181,117,0.15)] hover:bg-[#957052] px-5 py-4 rounded-xl text-[9px] font-black uppercase tracking-wider text-[#D9BFA0] transition-all"
              >
                Back
              </button>
              <button 
                type="submit"
                className="flex-1 bg-[#D8A865] text-[#1a0f06] hover:bg-[#B87948] px-3 py-4 rounded-xl text-[9px] font-black uppercase tracking-wider sm:tracking-[0.2em] transition-all shadow-lg"
              >
                <span className="sm:hidden">Submit Order</span>
                <span className="hidden sm:inline">Submit Order</span>
              </button>
            </div>
          </form>
        )}

        {/* ORDER SUCCESS STEP */}
        {checkoutStep === 'success' && (
          <div className="flex-1 overflow-y-auto flex flex-col p-4 sm:p-8 items-center justify-center text-center bg-[#79543B]">
            <span className="material-symbols-outlined text-6xl text-green-600 bg-green-50 p-6 rounded-full animate-bounce mb-6">verified</span>
            <span className="text-[9px] font-black text-[#D8A865] uppercase tracking-[0.2em] mb-1">Receipt Confirmed</span>
            <h4 className="text-xl font-black uppercase text-[#F7E8D2] mb-3">Masterpiece Order Placed!</h4>
            <p className="text-xs text-[#B99372] max-w-xs leading-relaxed mb-8">Thank you, <span className="font-bold text-[#F7E8D2]">{shippingInfo.name}</span>. An invoice receipt has been dispatched to <span className="font-bold text-[#F7E8D2]">{shippingInfo.email}</span>. Your bespoke jewelry item is officially under craftsmanship.</p>

            <div className="w-full bg-[#957052] border border-[rgba(229,181,117,0.15)] p-6 rounded-2xl text-[9px] uppercase text-[#B99372] font-bold text-left space-y-2 mb-8">
              <div className="flex justify-between border-b border-[rgba(229,181,117,0.15)] pb-2">
                <span>Order Reference:</span>
                <span className="text-[#F7E8D2] font-black">#SHM-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(229,181,117,0.15)] pb-2">
                <span>Shipment Destination:</span>
                <span className="text-[#F7E8D2] font-black truncate max-w-[150px]">{shippingInfo.address}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(229,181,117,0.15)] pb-2">
                <span>Status:</span>
                <span className="text-amber-800 font-black">Handcrafted</span>
              </div>
            </div>

            <button 
              onClick={() => {
                clearWholeCart();
                setShowCart(false);
              }}
              className="w-full bg-[#D8A865] text-[#1a0f06] hover:bg-[#B87948] py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg"
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
