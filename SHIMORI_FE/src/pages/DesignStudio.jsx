import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '@google/model-viewer';
import { modelGroups } from '../models';
import JewelryViewer from '../components/JewelryViewer';

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const MATERIAL_CONFIGS = {
  'Titan':         { color: [0.20, 0.22, 0.27, 1], metallic: 1.0, roughness: 0.40, displayColor: 'from-[#374151] to-[#6b7280]' },
  'Bạc':           { color: [0.85, 0.85, 0.87, 1], metallic: 1.0, roughness: 0.05, displayColor: 'from-[#cbd5e1] to-[#f8fafc]' },
  'Sắt không gỉ': { color: [0.50, 0.50, 0.52, 1], metallic: 1.0, roughness: 0.20, displayColor: 'from-[#52525b] to-[#a1a1aa]' },
};

const textures = ['Polished', 'Brushed', 'Hammered', 'Matte', 'Diamond-Cut'];

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
  { name: 'Diamond', color: 'bg-white shadow-inner', label: 'Princess' },
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
  <section className="mb-10">
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
    texture: 'Polished'
  });

  const settingModelUrl = useMemo(() => {
    const target = normalize(config.setting);
    const match = modelGroups.settings.find((m) => normalize(m.name) === target || normalize(m.key) === target);
    return match?.url || modelGroups.settings[0]?.url;
  }, [config.setting]);

  const gemModelUrl = useMemo(() => {
    const target = normalize(config.gemstone);
    return modelGroups.gems.find((g) => normalize(g.name) === target || normalize(g.key) === target)?.url;
  }, [config.gemstone]);


  const priceDetails = [
    { label: 'Base Metal', value: config.material, price: '+$2,450' },
    { label: 'Center Stone', value: `${config.gemstone} 1.5ct`, price: '+$10,800' },
    { label: 'Band Style', value: config.bandStyle, price: '+$850' },
    { label: 'Craftsmanship', value: `${config.texture} Finish`, price: 'Included' },
  ];
  const widthScale = (config.width / 2.5).toFixed(3);

  return (
    <div className="h-screen flex flex-col bg-white font-['Manrope'] overflow-hidden text-[#1a1a1a]">
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-8 shrink-0 z-[130]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-2xl">diamond</span>
          <h2 className="text-xl font-extrabold tracking-tighter uppercase">SHIMORI</h2>
        </div>
        <div className="flex items-center gap-6">
          <button className="bg-black text-white px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[#b08d26] transition-colors">Design Now</button>
          <span className="material-symbols-outlined text-gray-400">favorite</span>
          <span className="material-symbols-outlined text-gray-400">shopping_bag</span>
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
            </div>
          </div>

          <SidebarSection step="01" title="Stone Setting">
            <div className="grid grid-cols-3 gap-2">
              {settings.map((s) => (
                <button key={s.name} onClick={() => setConfig({...config, setting: s.name})}
                  className={`flex flex-col items-center justify-center p-4 border rounded transition-all ${config.setting === s.name ? 'border-[#b08d26] bg-[#b08d26]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <span className={`material-symbols-outlined text-xl mb-2 ${config.setting === s.name ? 'text-[#b08d26]' : 'text-gray-300'}`}>{s.icon}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{s.name}</span>
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection step="02" title="Precious Material">
            <div className="space-y-2">
              {materials.map((m) => (
                <button key={m.name} onClick={() => setConfig({...config, material: m.name})}
                  className={`w-full flex items-center justify-between p-4 border rounded ${config.material === m.name ? 'border-[#b08d26] bg-[#b08d26]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${m.color} border border-gray-100`}></div>
                    <span className="text-[10px] font-black uppercase">{m.name}</span>
                  </div>
                  {config.material === m.name && <span className="material-symbols-outlined text-[#b08d26] text-lg">check_circle</span>}
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection step="03" title="Primary Gemstone">
            <div className="flex flex-wrap gap-3">
              {gemstones.map((g) => (
                <button key={g.name} onClick={() => setConfig({...config, gemstone: g.name})}
                  className={`flex flex-col items-center gap-1.5 p-1 rounded-xl border-2 transition-all ${config.gemstone === g.name ? 'border-[#b08d26] bg-[#b08d26]/5' : 'border-transparent hover:border-gray-200'}`}>
                  {g.url ? (
                    <model-viewer
                      src={g.url}
                      auto-rotate
                      rotation-per-second="30deg"
                      exposure="1.4"
                      shadow-intensity="0"
                      style={{ width: '48px', height: '48px', background: 'transparent', pointerEvents: 'none' }}
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full ${g.color} shadow-sm border border-gray-100`} />
                  )}
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{g.label}</span>
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection step="04" title="Band Style">
            <div className="grid grid-cols-2 gap-2">
              {bandStyles.map((style) => (
                <button key={style} onClick={() => setConfig({...config, bandStyle: style})}
                  className={`py-3 border rounded text-[9px] font-black uppercase tracking-widest transition-all ${config.bandStyle === style ? 'border-[#b08d26] text-[#b08d26] bg-[#b08d26]/5' : 'border-gray-100 text-gray-400'}`}>
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

          <SidebarSection step="06" title="Surface Texture">
            <div className="space-y-2">
              {textures.map((t) => (
                <button key={t} onClick={() => setConfig({...config, texture: t})}
                  className={`w-full flex items-center justify-between p-4 border rounded transition-all ${config.texture === t ? 'border-[#b08d26] text-[#b08d26] bg-[#b08d26]/5' : 'border-gray-100 text-gray-400'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest">{t}</span>
                  <div className={`w-2 h-2 rounded-full ${config.texture === t ? 'bg-[#b08d26]' : 'bg-gray-200'}`}></div>
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
               <span className="text-[9px] font-black uppercase tracking-widest">Render: Ultra-High</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-[600px] shrink-0">
            <div className="relative group flex flex-col items-center">
              <div style={{ width: 'min(70vw, 900px)', height: 'min(70vw, 600px)' }}>
                <JewelryViewer
                  ringUrl={settingModelUrl}
                  gemUrl={gemModelUrl}
                  materialProps={MATERIAL_CONFIGS[config.material]}
                  ringWidthScale={parseFloat(widthScale)}
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
              <span>Refractive Index: 2.417</span>
            </div>
            <div className="flex gap-6">
              <span className="text-black font-black">Design ID: LUX-882-99</span>
              <span>© 2026 Unified 3D Studio</span>
            </div>
          </div>
          <div className="h-32 shrink-0"></div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[150]">
        <div
          className={`bg-white/95 backdrop-blur-xl border-t border-gray-100 px-12 py-12 transition-all duration-500 transform shadow-[0_-30px_60px_rgba(0,0,0,0.12)] ${showPriceBreakdown ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}
          onMouseEnter={() => setShowPriceBreakdown(true)}
          onMouseLeave={() => setShowPriceBreakdown(false)}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-4 gap-16">
            {priceDetails.map((item, idx) => (
              <div key={idx}>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">{item.label}</p>
                <div className="flex justify-between items-end border-b-2 border-gray-100 pb-4">
                  <span className="text-[14px] font-black uppercase text-gray-800 tracking-tight">{item.value}</span>
                  <span className="text-[14px] font-black text-[#b08d26]">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-28 bg-white border-t border-gray-100 flex items-center justify-between px-12 relative shadow-lg">
          <div className="flex gap-16 items-center">
            <div className="flex flex-col">
              <p className="text-[9px] font-black uppercase text-gray-400 mb-1 flex items-center gap-2">Total <span className="material-symbols-outlined text-[13px]">info</span></p>
              <div className="flex items-baseline gap-4">
                <h3 className="text-3xl font-black tracking-tighter text-black">$14,250.00</h3>
                <span className="text-[9px] text-green-600 font-black bg-green-50 px-2 py-1 rounded uppercase tracking-wider">In Stock</span>
              </div>
            </div>
          </div>

          <button
            onMouseEnter={() => setShowPriceBreakdown(true)}
            onMouseLeave={() => setShowPriceBreakdown(false)}
            onClick={() => navigate('/product-detail')}
            className="bg-[#b08d26] text-white px-12 py-5 rounded-xl font-black uppercase text-[11px] tracking-[0.3em] flex items-center gap-4 hover:bg-black transition-all shadow-lg shadow-[#b08d26]/10"
          >
            Proceed to Purchase <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: #b08d26; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
};

export default DesignStudio;