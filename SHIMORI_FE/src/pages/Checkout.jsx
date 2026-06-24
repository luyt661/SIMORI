import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    email: '',
    name: '',
    address: '',
    card: '',
    expiry: '',
    cvc: '',
  });

  // Load cart from localStorage
  useEffect(() => {
    const rawCart = localStorage.getItem('shimori_cart');
    if (rawCart) {
      try {
        setCart(JSON.parse(rawCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!shippingInfo.email || !shippingInfo.name || !shippingInfo.address || !shippingInfo.card) {
      toast.error('Please fill in all required fields.', {
        style: { background: '#6A452D', color: '#FFF3E4', fontSize: '11px', fontWeight: 'bold' }
      });
      return;
    }
    
    // Generate a random high-end order reference number
    const ref = `SHM-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderRef(ref);
    setIsSuccess(true);
    toast.success('Payment successful! Your order is being handcrafted.', {
      style: { background: '#6A452D', color: '#FFF3E4', fontSize: '11px', fontWeight: 'bold' }
    });

    // Save purchase details to localStorage for Account Order History
    const orderData = {
      orderRef: ref,
      date: new Date().toLocaleDateString('en-US'),
      total: totalAmount,
      items: cart,
      shippingInfo: {
        name: shippingInfo.name,
        email: shippingInfo.email,
        address: shippingInfo.address,
      },
    };

    const rawOrders = localStorage.getItem('shimori_orders');
    let ordersList = [];
    if (rawOrders) {
      try {
        ordersList = JSON.parse(rawOrders);
      } catch (err) {
        ordersList = [];
      }
    }
    localStorage.setItem('shimori_orders', JSON.stringify([orderData, ...ordersList]));
  };

  const handleFinish = () => {
    // Clear whole cart
    localStorage.removeItem('shimori_cart');
    window.dispatchEvent(new Event('storage'));
    navigate('/design');
  };

  return (
    <div className="bg-[#5A3925] font-['Manrope'] min-h-screen text-[#FFF3E4] flex flex-col transition-colors duration-300">
      <Toaster position="bottom-right" reverseOrder={false} />
      <Navbar />

      {!isSuccess ? (
        <main className="max-w-6xl mx-auto px-4 lg:px-8 py-10 flex-grow w-full">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between border-b border-[rgba(243,214,182,0.12)] pb-6">
            <div>
              <span className="text-[10px] font-black text-[#D7A36F] uppercase tracking-widest">SHIMORI Atelier</span>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-1">Checkout</h2>
            </div>
            <button
              onClick={() => navigate('/design')}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#D7A36F] hover:bg-[#7A5034] transition-all border border-[rgba(243,214,182,0.25)] px-4 py-2 rounded"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Return to Studio
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-6xl text-[#B99372] mb-4 font-light">shopping_cart_checkout</span>
              <p className="text-sm font-black uppercase tracking-widest text-[#B99372]">Your cart is currently empty</p>
              <p className="text-xs text-[#B99372] mt-2 max-w-xs leading-relaxed">Customize your luxury item in our 3D Studio and add it to your cart to begin the checkout process.</p>
              <button
                onClick={() => navigate('/design')}
                className="mt-6 bg-gradient-to-r from-[#D7A36F] to-[#B87948] hover:from-[#B87948] hover:to-[#D7A36F] text-white px-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"
              >
                Go to Design Studio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* LEFT: SHIPPING & BILLING FORM */}
              <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 space-y-8 bg-[#6A452D] p-6 sm:p-8 rounded-3xl border border-[rgba(243,214,182,0.25)]">
                <div>
                  <span className="text-[8px] font-black text-[#D7A36F] uppercase tracking-widest">Step 1 of 2</span>
                  <h3 className="text-lg font-black uppercase tracking-wider mt-1">Shipping & Billing</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">Email Address *</label>
                    <input
                      required
                      type="email"
                      placeholder="client@luxury.com"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      className="w-full border border-[rgba(243,214,182,0.12)] bg-[#6B442B] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D7A36F] font-bold text-[#FFF3E4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="ALEXANDRA SMITH"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value.toUpperCase() })}
                      className="w-full border border-[rgba(243,214,182,0.12)] bg-[#6B442B] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D7A36F] font-bold text-[#FFF3E4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">Shipping Address *</label>
                    <input
                      required
                      type="text"
                      placeholder="128 FIFTH AVENUE, NEW YORK, NY"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value.toUpperCase() })}
                      className="w-full border border-[rgba(243,214,182,0.12)] bg-[#6B442B] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D7A36F] font-bold text-[#FFF3E4]"
                    />
                  </div>

                  <div className="border-t border-[rgba(243,214,182,0.12)] pt-6">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-[#D7A36F] mb-4">Payment Credentials</h4>
                    <div>
                      <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">Card Number *</label>
                      <input
                        required
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={shippingInfo.card}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, card: e.target.value })}
                        className="w-full border border-[rgba(243,214,182,0.12)] bg-[#6B442B] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D7A36F] font-bold text-[#FFF3E4]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">Expiry *</label>
                        <input
                          required
                          type="text"
                          placeholder="MM/YY"
                          value={shippingInfo.expiry}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, expiry: e.target.value })}
                          className="w-full border border-[rgba(243,214,182,0.12)] bg-[#6B442B] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D7A36F] font-bold text-center text-[#FFF3E4]"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-[#B99372] uppercase tracking-widest mb-1.5">CVC *</label>
                        <input
                          required
                          type="text"
                          placeholder="123"
                          value={shippingInfo.cvc}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, cvc: e.target.value })}
                          className="w-full border border-[rgba(243,214,182,0.12)] bg-[#6B442B] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D7A36F] font-bold text-center text-[#FFF3E4]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/design')}
                    className="border border-[rgba(243,214,182,0.25)] text-[#D7A36F] hover:bg-[#7A5034] px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#D7A36F] to-[#B87948] hover:from-[#B87948] hover:to-[#D7A36F] text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-[#D7A36F]/20"
                  >
                    Submit Order & Pay ${totalAmount.toLocaleString()}
                  </button>
                </div>
              </form>

              {/* RIGHT: ORDER SUMMARY */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#6A452D] p-6 rounded-3xl border border-[rgba(243,214,182,0.25)]">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#D7A36F] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">shopping_cart</span>
                    Your Cart Details
                  </h3>

                  <div className="divide-y divide-[rgba(243,214,182,0.12)] max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                    {cart.map((item) => (
                      <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                        <div className="w-14 h-14 rounded-xl bg-[#7A5034] flex items-center justify-center shrink-0 border border-[rgba(243,214,182,0.12)]">
                          <div className={`w-5 h-5 rotate-45 ${item.gemColor} border border-[rgba(243,214,182,0.12)]`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black uppercase truncate">{item.title}</h4>
                          <div className="text-[8px] uppercase tracking-wide text-[#B99372] mt-1 space-y-0.5 font-bold">
                            <p>{item.config.setting} Setting · {item.config.material} · {item.config.width}mm</p>
                            <p>{item.config.gemstone} · {item.gemCarat.toFixed(1)} ct</p>
                            {item.engraving && <p className="text-[#D7A36F] font-serif italic truncate">Engraved: "{item.engraving}"</p>}
                          </div>
                          <p className="text-xs font-black text-[#D7A36F] mt-2">${item.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[rgba(243,214,182,0.12)] mt-6 pt-6 space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-black text-[#B99372] uppercase tracking-widest">Order Total</span>
                      <span className="text-2xl font-black text-[#D7A36F]">
                        ${totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[#2d8a4e] bg-[#2d8a4e]/10 px-3 py-2 rounded-xl w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2d8a4e] animate-pulse"></span>
                      Guaranteed Insured Delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : (
        /* ORDER SUCCESS SCREEN */
        <main className="max-w-xl mx-auto px-4 py-20 flex-grow flex flex-col items-center justify-center text-center w-full">
          <span className="material-symbols-outlined text-6xl text-[#2d8a4e] bg-[#2d8a4e]/10 p-6 rounded-full animate-bounce mb-6">verified</span>
          <span className="text-[9px] font-black text-[#D7A36F] uppercase tracking-[0.2em] mb-1">Receipt Confirmed</span>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-[#FFF3E4] mb-3">Masterpiece Placed!</h2>
          <p className="text-xs text-[#B99372] max-w-sm leading-relaxed mb-8">
            Thank you, <span className="font-bold text-[#FFF3E4]">{shippingInfo.name}</span>. An invoice receipt has been dispatched to <span className="font-bold text-[#D7A36F]">{shippingInfo.email}</span>. Your bespoke jewelry is officially under craftsmanship.
          </p>

          <div className="w-full bg-[#6A452D] border border-[rgba(243,214,182,0.25)] p-6 rounded-3xl text-[9px] uppercase text-[#B99372] font-black text-left space-y-2.5 mb-8">
            <div className="flex justify-between border-b border-[rgba(243,214,182,0.12)] pb-2">
              <span>Order Reference:</span>
              <span className="text-[#FFF3E4] font-black">{orderRef}</span>
            </div>
            <div className="flex flex-col border-b border-[rgba(243,214,182,0.12)] pb-2 gap-1">
              <span className="mb-0.5">Purchased Products:</span>
              <div className="text-[#FFF3E4] font-black space-y-1.5 pl-2 border-l border-[#D7A36F]">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-4">
                    <span className="truncate max-w-[240px]">{item.title}</span>
                    <span className="text-[#B99372] text-[8px] font-bold shrink-0">${item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between border-b border-[rgba(243,214,182,0.12)] pb-2">
              <span>Shipment Destination:</span>
              <span className="text-[#FFF3E4] font-black truncate max-w-[200px]">{shippingInfo.address}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(243,214,182,0.12)] pb-2">
              <span>Status:</span>
              <span className="text-[#D7A36F] font-black">Handcrafted Artistry</span>
            </div>
            <div className="flex justify-between pt-2">
              <span>Paid amount:</span>
              <span className="text-[#D7A36F] font-black text-xs">${totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full bg-gradient-to-r from-[#D7A36F] to-[#B87948] hover:from-[#B87948] hover:to-[#D7A36F] text-white py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg"
          >
            Continue Designing
          </button>
        </main>
      )}

      {/* FOOTER */}
      <footer className="py-8 border-t border-[rgba(243,214,182,0.12)] mt-auto">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-black uppercase tracking-[0.2em] text-[#B99372]">
          <p>© 2026 SHIMORI FINE JEWELRY. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a className="hover:text-[#D7A36F] transition-colors" href="#">Privacy</a>
            <a className="hover:text-[#D7A36F] transition-colors" href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
