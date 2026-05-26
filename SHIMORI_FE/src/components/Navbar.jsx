import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Collections', sectionId: 'collections' },
  { label: 'Process', sectionId: 'process' },
  { label: 'About', sectionId: 'about' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      const raw = localStorage.getItem('shimori_cart');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setCartCount(parsed.length || 0);
        } catch (e) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname === '/home') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(`/home#${sectionId}`);
    }
  };

  return (
    <header
      className={`bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-[100] shadow-sm transition-all duration-300 ${
        isHovered ? 'h-16' : 'h-12'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-center transition-all duration-300 ${isHovered ? 'gap-6' : 'gap-4'}`}>
        <div className={`flex items-center cursor-pointer whitespace-nowrap transition-all duration-300 ${isHovered ? 'gap-2' : 'gap-1'}`} onClick={() => navigate('/home')}>
          <span className={`material-symbols-outlined flex-shrink-0 text-black transition-all duration-300 ${isHovered ? 'text-2xl' : 'text-xl'}`}>diamond</span>
          <h2 className={`font-extrabold tracking-tighter uppercase text-black transition-all duration-300 ${isHovered ? 'text-base' : 'text-sm'}`}>SHIMORI</h2>
        </div>

        <nav className={`hidden lg:flex items-center transition-all duration-300 ${isHovered ? 'gap-6' : 'gap-4'}`}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.sectionId}
              href={`/#${item.sectionId}`}
              onClick={(e) => handleNavClick(e, item.sectionId)}
              className={`font-black uppercase tracking-widest text-gray-500 hover:text-black transition-all duration-300 cursor-pointer ${
                isHovered ? 'text-[10px]' : 'text-[8px]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className={`flex items-center flex-1 justify-end transition-all duration-300 ${isHovered ? 'gap-5' : 'gap-3'}`}>
        <div className={`relative flex-1 max-w-xs transition-all duration-300 ${!isHovered && 'hidden lg:block'}`}>
          <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300 ${
            isHovered ? 'text-base' : 'text-sm'
          }`}>search</span>
          <input
            type="text"
            placeholder="Find your style..."
            className={`w-full bg-gray-50 border-none rounded-full pl-9 pr-3 font-medium focus:ring-2 focus:ring-[#facc15]/50 outline-none transition-all duration-300 ${
              isHovered ? 'py-2 text-xs' : 'py-1.5 text-[10px]'
            }`}
          />
        </div>

        <button
          onClick={() => navigate('/design')}
          className={`bg-[#facc15] text-black rounded-md font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 shadow-sm whitespace-nowrap ${
            isHovered ? 'px-4 py-2 text-[10px]' : 'px-3 py-1.5 text-[9px]'
          }`}
        >
          Design Now
        </button>

        <Link
          to="/login"
          className={`text-black rounded-md font-black uppercase tracking-widest hover:text-[#facc15] transition-all duration-300 whitespace-nowrap hidden sm:block ${
            isHovered ? 'px-3 py-2 text-[10px]' : 'px-2 py-1.5 text-[9px]'
          }`}
        >
          Sign In
        </Link>

        <div className={`flex items-center text-gray-400 transition-all duration-300 ${isHovered ? 'gap-3' : 'gap-2'}`}>
          <span
            onClick={() => navigate('/design')}
            className={`material-symbols-outlined cursor-pointer hover:text-black transition-colors ${
              isHovered ? 'text-base' : 'text-sm'
            }`}
          >
            favorite
          </span>
          <div
            onClick={() => navigate('/design?openCart=true')}
            className="relative cursor-pointer"
          >
            <span className={`material-symbols-outlined hover:text-black transition-colors ${
              isHovered ? 'text-base' : 'text-sm'
            }`}>shopping_cart</span>
            {cartCount > 0 && (
              <span className={`absolute bg-black text-white text-[7px] font-bold rounded-full flex items-center justify-center transition-all duration-300 ${
                isHovered ? '-top-0.5 -right-0.5 w-4 h-4' : '-top-1 -right-1 w-3.5 h-3.5'
              }`}>
                {cartCount}
              </span>
            )}
          </div>
          <span className={`material-symbols-outlined cursor-pointer hover:text-black transition-colors ${
            isHovered ? 'text-base' : 'text-sm'
          }`}>person</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
