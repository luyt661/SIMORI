import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Account = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [activeInvoice, setActiveInvoice] = useState(null);

  const [profile, setProfile] = useState({
    name: 'ALEXANDRA SMITH',
    email: 'alexandra@luxury.com',
    phone: '+1 (555) 019-2831',
    address: '128 FIFTH AVENUE, NEW YORK, NY',
    memberSince: 'October 2024',
  });

  const [passwordFields, setPasswordFields] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [supportMessage, setSupportMessage] = useState({
    subject: '',
    body: '',
  });

  // Load localStorage data
  useEffect(() => {
    // Load orders
    const rawOrders = localStorage.getItem('shimori_orders');
    if (rawOrders) {
      try { setOrders(JSON.parse(rawOrders)); } catch (e) {}
    }

    // Load saved collections
    const rawSaved = localStorage.getItem('shimori_saved_designs');
    if (rawSaved) {
      try { setSavedDesigns(JSON.parse(rawSaved)); } catch (e) {}
    }

    // Load profile
    const rawProfile = localStorage.getItem('shimori_profile');
    if (rawProfile) {
      try { setProfile(JSON.parse(rawProfile)); } catch (e) {}
    }
  }, []);

  const saveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('shimori_profile', JSON.stringify(profile));
    toast.success('Profile details updated successfully!', {
      style: { background: '#1a1a1a', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
    });
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwordFields.newPass !== passwordFields.confirm) {
      toast.error("New passwords do not match.", {
        style: { background: '#1a1a1a', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
      });
      return;
    }
    toast.success('Security password updated successfully!', {
      style: { background: '#1a1a1a', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
    });
    setPasswordFields({ current: '', newPass: '', confirm: '' });
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    toast.success('Inquiry sent! A private concierge will contact you shortly.', {
      style: { background: '#1a1a1a', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
    });
    setSupportMessage({ subject: '', body: '' });
  };

  const handleSignOut = () => {
    localStorage.removeItem('shimori_logged_in');
    toast.success('Logged out successfully.', {
      style: { background: '#1a1a1a', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
    });
    setTimeout(() => navigate('/login'), 800);
  };

  const deleteSavedDesign = (id) => {
    const updated = savedDesigns.filter((d) => d.id !== id);
    setSavedDesigns(updated);
    localStorage.setItem('shimori_saved_designs', JSON.stringify(updated));
    toast.success('Design deleted successfully.');
  };

  const addSavedToCart = (design) => {
    const rawCart = localStorage.getItem('shimori_cart');
    let cart = [];
    if (rawCart) {
      try { cart = JSON.parse(rawCart); } catch (e) {}
    }

    const cartItem = {
      id: Date.now(),
      title: `Bespoke Ring - Design #${Math.floor(1000 + Math.random() * 9000)}`,
      config: design.config,
      gemCarat: design.gemCarat,
      engraving: design.engraving,
      engravingFont: design.engravingFont,
      price: design.totalPrice,
      gemColor: 'bg-white shadow-inner border border-gray-200',
    };

    const updated = [...cart, cartItem];
    localStorage.setItem('shimori_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    toast.success('Added ring to Cart!', {
      style: { background: '#1a1a1a', color: '#fff', fontSize: '11px', fontWeight: 'bold' }
    });
  };

  const loadSavedInStudio = (design) => {
    const params = new URLSearchParams();
    params.set('setting', design.config.setting);
    params.set('material', design.config.material);
    params.set('gemstone', design.config.gemstone);
    params.set('bandStyle', design.config.bandStyle);
    params.set('width', design.config.width.toString());
    params.set('carat', design.gemCarat.toString());
    if (design.engraving) {
      params.set('engraving', design.engraving);
      params.set('font', design.engravingFont);
    }
    params.set('lighting', design.lightingPreset || 'studio');
    navigate(`/design?${params.toString()}`);
  };

  // Calculate privilege tier and points based on total amount spent
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const rewardsPoints = totalSpent; // $1 spent = 1 point
  
  const getPrivilegeTier = () => {
    if (totalSpent >= 20000) return { name: 'Emerald Elite Privilege', color: 'text-emerald-500', card: 'bg-gradient-to-tr from-emerald-950 via-slate-900 to-black border-emerald-500/50' };
    if (totalSpent >= 10000) return { name: 'VIP Platinum Black Card', color: 'text-[#b08d26]', card: 'bg-gradient-to-tr from-stone-900 via-neutral-950 to-black border-[#b08d26]/40' };
    if (totalSpent > 0) return { name: 'Gold Privilege Card', color: 'text-amber-500', card: 'bg-gradient-to-tr from-amber-950 via-stone-900 to-black border-amber-500/30' };
    return { name: 'Privilege Club Member', color: 'text-gray-400', card: 'bg-gradient-to-tr from-gray-900 via-slate-950 to-black border-gray-500/20' };
  };

  const tier = getPrivilegeTier();

  return (
    <div className="bg-white dark:bg-[#1a1a1a] font-['Manrope'] min-h-screen text-[#1a1a1a] dark:text-white flex flex-col transition-colors duration-300">
      <Toaster position="bottom-right" reverseOrder={false} />
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-10 flex-grow w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="md:col-span-4 bg-gray-50/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/10 pb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#b08d26] to-yellow-500 flex items-center justify-center text-white text-lg font-black tracking-widest shadow-md">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black uppercase truncate">{profile.name}</h3>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#b08d26] mt-0.5">{tier.name}</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Joined {profile.memberSince}</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {[
                { id: 'profile', label: 'Dashboard & Profile', icon: 'dashboard' },
                { id: 'orders', label: `Order History (${orders.length})`, icon: 'history' },
                { id: 'saved', label: `Saved Designs (${savedDesigns.length})`, icon: 'diamond' },
                { id: 'privilege', label: 'Privilege Club', icon: 'workspace_premium' },
                { id: 'security', label: 'Security & Support', icon: 'security' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id
                      ? 'bg-black dark:bg-[#b08d26] text-white shadow-md'
                      : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-500/25 mt-4"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Sign Out
              </button>
            </nav>
          </aside>

          {/* ACTIVE TAB DETAILS */}
          <section className="md:col-span-8 space-y-6">
            
            {/* TAB: DASHBOARD & PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-[#1a1a1a] space-y-6">
                <div>
                  <span className="text-[9px] font-black text-[#b08d26] uppercase tracking-widest">Customer Center</span>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-1">Dashboard & Profile</h2>
                </div>

                {/* Quick stats grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Invested', value: `$${totalSpent.toLocaleString()}`, color: 'text-[#b08d26]' },
                    { label: 'Privilege Points', value: `${rewardsPoints.toLocaleString()} pts`, color: 'text-[#b08d26]' },
                    { label: 'Saved Designs', value: savedDesigns.length, color: 'text-slate-800 dark:text-white' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex flex-col justify-center">
                      <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</span>
                      <span className={`text-sm md:text-lg font-black uppercase ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={saveProfile} className="bg-gray-50/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#b08d26]">Edit Profile Details</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value.toUpperCase() })}
                        className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b08d26] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b08d26] font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b08d26] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Default Shipping Address</label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value.toUpperCase() })}
                      className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#b08d26] font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-black dark:bg-[#b08d26] text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:opacity-85 transition-all shadow-md mt-2"
                  >
                    Save Profile Settings
                  </button>
                </form>
              </div>
            )}

            {/* TAB: ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-black text-[#b08d26] uppercase tracking-widest">Client History</span>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-1">My Orders</h2>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl p-12 text-center flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-4">history</span>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">No Orders Placed Yet</p>
                    <p className="text-[10px] text-gray-400 mt-2 max-w-xs leading-relaxed">Customize your jewelry, checkout successfully, and your tracking information will list here.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order, idx) => (
                      <div key={idx} className="bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-3xl space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200/50 dark:border-white/10 pb-4 gap-2">
                          <div>
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{order.date}</span>
                            <h4 className="text-xs font-black uppercase mt-1">Order Ref: {order.orderRef}</h4>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-[#b08d26]">${order.total.toLocaleString()}</span>
                            <button
                              onClick={() => setActiveInvoice(order)}
                              className="text-[8px] font-black uppercase tracking-widest text-[#b08d26] border-b border-[#b08d26] hover:text-black dark:hover:text-white hover:border-black transition-all"
                            >
                              Print Invoice
                            </button>
                          </div>
                        </div>

                        {/* Items list */}
                        <div className="space-y-4">
                          {order.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex gap-4 items-start">
                              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1a1a1a] flex items-center justify-center shrink-0 border border-gray-100 dark:border-white/5">
                                <div className={`w-4 h-4 rotate-45 ${item.gemColor || 'bg-gray-200'} border border-gray-200`}></div>
                              </div>
                              <div className="flex-grow min-w-0">
                                <h5 className="text-[10px] font-black uppercase truncate">{item.title}</h5>
                                <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">
                                  {item.config.setting} setting · {item.config.material} · {item.config.width}mm · {item.config.gemstone}
                                </p>
                              </div>
                              <span className="text-[10px] font-black">${item.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        {/* Tracking Progression */}
                        <div className="pt-4 border-t border-gray-200/50 dark:border-white/10">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">Atelier Processing Status</p>
                          <div className="grid grid-cols-4 items-center relative text-center">
                            {/* Bar background */}
                            <div className="absolute left-[12.5%] right-[12.5%] top-[10px] h-0.5 bg-gray-200 dark:bg-white/10 z-0"></div>
                            {/* Active bar segment */}
                            <div className="absolute left-[12.5%] w-[33%] top-[10px] h-0.5 bg-[#b08d26] z-0"></div>

                            {[
                              { label: 'Ordered', active: true },
                              { label: 'Atelier Crafting', active: true },
                              { label: 'Secured Transport', active: false },
                              { label: 'Delivered', active: false },
                            ].map((step, stepIdx) => (
                              <div key={stepIdx} className="flex flex-col items-center z-10">
                                <div className={`w-5 h-5 rounded-full border-2 bg-white dark:bg-[#1a1a1a] flex items-center justify-center ${step.active ? 'border-[#b08d26]' : 'border-gray-200 dark:border-white/10'}`}>
                                  {step.active && <div className="w-2.5 h-2.5 rounded-full bg-[#b08d26]"></div>}
                                </div>
                                <span className={`text-[7px] font-black uppercase mt-2 ${step.active ? 'text-[#b08d26]' : 'text-gray-400'}`}>{step.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SAVED DESIGNS */}
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-black text-[#b08d26] uppercase tracking-widest">Design Vault</span>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-1">Saved Designs</h2>
                </div>

                {savedDesigns.length === 0 ? (
                  <div className="bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl p-12 text-center flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-4 font-light">favorite_border</span>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">No Saved Designs Yet</p>
                    <p className="text-[10px] text-gray-400 mt-2 max-w-xs leading-relaxed">Save your custom creation from the customizer footer to easily reload, buy, or compare them later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedDesigns.map((d) => (
                      <div key={d.id} className="bg-gray-50/50 dark:bg-white/5 p-5 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col justify-between group hover:border-[#b08d26] transition-all">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Saved {d.date}</span>
                              <h4 className="text-xs font-black uppercase mt-1">Bespoke Ring #{d.id.toString().slice(-4)}</h4>
                            </div>
                            <span className="text-xs font-black text-[#b08d26]">${d.totalPrice.toLocaleString()}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-y-3 gap-x-2 bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl mb-6 text-[8px] uppercase font-bold text-gray-400">
                            <div>Setting: <span className="text-black dark:text-white font-black">{d.config.setting}</span></div>
                            <div>Metal: <span className="text-black dark:text-white font-black">{d.config.material}</span></div>
                            <div>Gemstone: <span className="text-black dark:text-white font-black">{d.config.gemstone}</span></div>
                            <div>Width: <span className="text-black dark:text-white font-black">{d.config.width}mm</span></div>
                            <div className="col-span-2">Carat Weight: <span className="text-black dark:text-white font-black">{d.gemCarat.toFixed(1)}ct</span></div>
                            {d.engraving && <div className="col-span-2 truncate">Text: <span className="text-amber-800 dark:text-amber-600 font-serif italic">"{d.engraving}"</span></div>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadSavedInStudio(d)}
                              className="flex-1 bg-black dark:bg-[#b08d26] hover:opacity-90 text-white py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-colors"
                            >
                              Load Design
                            </button>
                            <button
                              onClick={() => addSavedToCart(d)}
                              className="flex-1 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-colors"
                            >
                              Buy Design
                            </button>
                          </div>
                          <button
                            onClick={() => deleteSavedDesign(d.id)}
                            className="w-full text-center text-[7px] font-black uppercase text-red-500 hover:text-red-600 tracking-widest pt-1"
                          >
                            Delete Design
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: PRIVILEGE CLUB */}
            {activeTab === 'privilege' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-black text-[#b08d26] uppercase tracking-widest">Privilege Club</span>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-1">SHIMORI Privileges</h2>
                </div>

                {/* VIP CARD */}
                <div className={`relative h-48 sm:h-56 rounded-3xl ${tier.card} border p-8 flex flex-col justify-between overflow-hidden shadow-2xl animate-fadeIn`}>
                  {/* Card Background Pattern */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute w-[500px] h-[500px] border border-white/30 rounded-full -top-40 -left-20"></div>
                    <div className="absolute w-[300px] h-[300px] border border-white/20 rounded-full -bottom-10 -right-10"></div>
                  </div>

                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#b08d26] text-xl">diamond</span>
                      <h3 className="text-md font-black uppercase tracking-widest text-white">SHIMORI</h3>
                    </div>
                    <span className="material-symbols-outlined text-[#b08d26] text-2xl animate-pulse">workspace_premium</span>
                  </div>

                  <div className="relative z-10 text-left">
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Elite Tier Privilege</p>
                    <h4 className="text-lg sm:text-xl font-black uppercase text-[#b08d26] mt-0.5 tracking-wider">{tier.name}</h4>
                  </div>

                  <div className="flex justify-between items-end relative z-10 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[7px] text-gray-500 uppercase tracking-widest font-black">Client Name</p>
                      <p className="text-xs font-black uppercase text-white mt-0.5">{profile.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] text-gray-500 uppercase tracking-widest font-black">Accrued Points</p>
                      <p className="text-xs font-black uppercase text-[#b08d26] mt-0.5">{rewardsPoints.toLocaleString()} PTS</p>
                    </div>
                  </div>
                </div>

                {/* Points bar */}
                <div className="bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-3xl">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-3">
                    <span>Elite Progress</span>
                    <span className="text-[#b08d26]">{rewardsPoints.toLocaleString()} / 20,000 PTS</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-[#b08d26] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (rewardsPoints / 20000) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[8px] text-gray-400 font-bold uppercase mt-2.5">
                    {rewardsPoints >= 20000 
                      ? "Congratulations! You have unlocked the ultimate Emerald Elite Privilege VIP status."
                      : `Earn ${(20000 - rewardsPoints).toLocaleString()} more points to unlock Emerald Elite Privilege.`
                    }
                  </p>
                </div>

                {/* Benefits List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#b08d26]">Your Exclusive Privileges</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: 'local_shipping', title: 'Free Insured Transport', desc: 'Secure armored delivery with full value insurance on every order.' },
                      { icon: 'verified', title: 'Lifetime Care & Warranty', desc: 'Complimentary biannual professional cleaning and stone setting inspections.' },
                      { icon: 'support_agent', title: '24/7 Concierge Access', desc: 'Direct priority phone line to private atelier designers and support specialists.' },
                      { icon: 'schedule', title: 'Priority Atelier Crafting', desc: 'Custom jewelry orders skip processing queues directly into designer workbench.' },
                    ].map((benefit, idx) => (
                      <div key={idx} className="bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex gap-3">
                        <span className="material-symbols-outlined text-[#b08d26] text-xl shrink-0 mt-0.5">{benefit.icon}</span>
                        <div>
                          <h5 className="text-[10px] font-black uppercase">{benefit.title}</h5>
                          <p className="text-[8px] text-gray-400 leading-normal mt-1 font-semibold">{benefit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: SECURITY & SUPPORT */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                
                {/* FAQ section */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] font-black text-[#b08d26] uppercase tracking-widest">Atelier Help Center</span>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-1">Frequently Asked Questions</h2>
                  </div>

                  <div className="space-y-2">
                    {[
                      { q: 'How do I care for my customized SHIMORI jewelry?', a: 'We recommend gentle washing with mild dish soap and lukewarm water using a soft toothbrush. Avoid harsh chemicals or ultra-sonic cleaners on emeralds and opals. Bring your piece to a partner boutique every six months for a complimentary check.' },
                      { q: 'Can I resize my custom ring after delivery?', a: 'Classic Prong solitaires and plain bands can easily be resized within 2 sizes. Eternity bands and complex Pavé designs cannot be resized due to the continuous stone configurations, so please double-check your ring sizing before ordering.' },
                      { q: 'Is delivery armored and fully insured?', a: 'Yes. Every SHIMORI shipment is treated as precious cargo. It is shipped in an unbranded outer box for security, handled by certified high-security logistics partners, and fully insured for its full retail value until signed for.' },
                    ].map((faq, idx) => (
                      <details key={idx} className="group border border-gray-100 dark:border-white/5 rounded-2xl bg-gray-50/30 dark:bg-white/5 overflow-hidden transition-all duration-300">
                        <summary className="flex justify-between items-center p-4 cursor-pointer text-[10px] font-black uppercase tracking-wide list-none outline-none select-none text-slate-800 dark:text-white hover:text-[#b08d26]">
                          {faq.q}
                          <span className="material-symbols-outlined text-sm transition-transform duration-300 group-open:rotate-180">expand_more</span>
                        </summary>
                        <p className="px-4 pb-4 text-[9px] leading-relaxed text-gray-500 font-semibold border-t border-gray-100 dark:border-white/5 pt-3">
                          {faq.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>

                {/* Password update & support form splits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-gray-100 dark:border-white/10">
                  
                  {/* Security form */}
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#b08d26]">Update Security Password</h4>
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Password</label>
                      <input
                        required
                        type="password"
                        value={passwordFields.current}
                        onChange={(e) => setPasswordFields({ ...passwordFields, current: e.target.value })}
                        className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#b08d26] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">New Password</label>
                      <input
                        required
                        type="password"
                        value={passwordFields.newPass}
                        onChange={(e) => setPasswordFields({ ...passwordFields, newPass: e.target.value })}
                        className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#b08d26] font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Confirm Password</label>
                      <input
                        required
                        type="password"
                        value={passwordFields.confirm}
                        onChange={(e) => setPasswordFields({ ...passwordFields, confirm: e.target.value })}
                        className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#b08d26] font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-black dark:bg-[#b08d26] text-white px-6 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest hover:opacity-85 transition-all shadow-md"
                    >
                      Update Password
                    </button>
                  </form>

                  {/* Customer support form */}
                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#b08d26]">Private Concierge Inquiry</h4>
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Inquiry Subject</label>
                      <input
                        required
                        type="text"
                        placeholder="E.g., CUSTOM GEMSTONE REQUEST"
                        value={supportMessage.subject}
                        onChange={(e) => setSupportMessage({ ...supportMessage, subject: e.target.value.toUpperCase() })}
                        className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#b08d26] font-bold uppercase placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Details / Message</label>
                      <textarea
                        required
                        rows="3"
                        placeholder="Describe your request in detail..."
                        value={supportMessage.body}
                        onChange={(e) => setSupportMessage({ ...supportMessage, body: e.target.value })}
                        className="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#b08d26] font-bold placeholder:text-gray-400"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="bg-black dark:bg-[#b08d26] text-white px-6 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest hover:opacity-85 transition-all shadow-md"
                    >
                      Send Message Inquiry
                    </button>
                  </form>

                </div>
              </div>
            )}

          </section>
        </div>
      </main>

      {/* POPUP MODAL: DETAILED INVOICE RECEIPT */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-2xl text-[#1a1a1a]">
            <button
              onClick={() => setActiveInvoice(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="border-b-2 border-gray-100 pb-6 text-center space-y-2">
              <span className="material-symbols-outlined text-[#b08d26] text-4xl">diamond</span>
              <h2 className="text-xl font-extrabold tracking-tighter uppercase">SHIMORI FINE JEWELRY</h2>
              <p className="text-[8px] font-black tracking-widest text-[#b08d26] uppercase">Receipt Confirmation Invoice</p>
            </div>

            <div className="py-6 space-y-4 text-[9px] uppercase font-bold text-gray-500">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Invoice Date:</span>
                <span className="text-black font-black">{activeInvoice.date}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Order Reference:</span>
                <span className="text-black font-black">{activeInvoice.orderRef}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Payment Method:</span>
                <span className="text-black font-black">Secure Credit Card</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span>Shipping To:</span>
                <span className="text-black font-black truncate max-w-[200px]">{activeInvoice.shippingInfo.address}</span>
              </div>
              
              {/* Items listing inside invoice */}
              <div className="pt-2">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-2">Invoice Summary Items</span>
                <div className="space-y-3 bg-gray-50 p-4 rounded-2xl max-h-[150px] overflow-y-auto pr-1">
                  {activeInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[8px] text-gray-500 font-bold border-b border-gray-100/50 pb-2 last:border-b-0 last:pb-0">
                      <div className="min-w-0 pr-4">
                        <span className="text-black font-black block">{item.title.toUpperCase()}</span>
                        <span className="text-[7px] lowercase tracking-normal leading-none block mt-0.5">
                          {item.config.setting} setting, {item.config.material}, {item.config.width}mm, {item.config.gemstone}
                        </span>
                      </div>
                      <span className="text-black font-black shrink-0">${item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-baseline pt-4 border-t-2 border-gray-100">
                <span className="text-[10px] font-black text-black">Total Paid Amount</span>
                <span className="text-lg font-black text-[#b08d26]">${activeInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-black text-white hover:bg-[#b08d26] py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print Document
              </button>
              <button
                onClick={() => setActiveInvoice(null)}
                className="flex-1 border border-gray-200 hover:bg-gray-100 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-8 border-t border-gray-100 dark:border-white/5 mt-auto">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
          <p>© 2026 SHIMORI FINE JEWELRY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a className="hover:text-[#facc15] transition-colors" href="#">Privacy</a>
            <a className="hover:text-[#facc15] transition-colors" href="#">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Account;
