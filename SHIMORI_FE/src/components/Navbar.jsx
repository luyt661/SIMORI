import { useNavigate, useLocation, Link } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Collections', sectionId: 'collections' },
  { label: 'Process', sectionId: 'process' },
  { label: 'About', sectionId: 'about' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/');
      // Sau khi navigate về home, scroll sẽ không hoạt động ngay — user có thể click lại
    }
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-[100] shadow-sm">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined text-2xl">diamond</span>
          <h2 className="text-xl font-extrabold tracking-tighter uppercase">SHIMORI</h2>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.sectionId}
              href={`/#${item.sectionId}`}
              onClick={(e) => handleNavClick(e, item.sectionId)}
              className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors cursor-pointer"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6 flex-1 justify-end max-w-2xl">
        <div className="relative flex-1 max-w-xs">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Find your style..."
            className="w-full bg-gray-50 border-none rounded-full py-2.5 pl-11 pr-4 text-xs font-medium focus:ring-2 focus:ring-[#facc15]/50 outline-none transition-all"
          />
        </div>

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
  );
};

export default Navbar;
