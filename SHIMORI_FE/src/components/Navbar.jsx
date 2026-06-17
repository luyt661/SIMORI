import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Collections', sectionId: 'collections' },
  { label: 'Process', sectionId: 'process' },
  { label: 'About', sectionId: 'about' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateNavbar = () => {
      const rawCart = localStorage.getItem('shimori_cart');

      if (rawCart) {
        try {
          const parsedCart = JSON.parse(rawCart);
          setCartCount(Array.isArray(parsedCart) ? parsedCart.length : 0);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }

      setIsLoggedIn(Boolean(localStorage.getItem('token')));
    };

    updateNavbar();
    window.addEventListener('storage', updateNavbar);

    return () => {
      window.removeEventListener('storage', updateNavbar);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleNavClick = (event, sectionId) => {
    event.preventDefault();
    setIsMobileMenuOpen(false);

    if (location.pathname === '/home' || location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return;
    }

    navigate(`/home#${sectionId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('shimori_logged_in');

    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-[100] border-b border-gray-100 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-10">
        <div className="flex min-w-0 items-center gap-12">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex shrink-0 items-center gap-2"
            aria-label="Go to home page"
          >
            <span className="material-symbols-outlined text-2xl">diamond</span>
            <span className="text-lg font-extrabold uppercase tracking-tighter sm:text-xl">
              SHIMORI
            </span>
          </button>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.sectionId}
                href={`/home#${item.sectionId}`}
                onClick={(event) => handleNavClick(event, item.sectionId)}
                className="text-[11px] font-black uppercase tracking-widest text-gray-500 transition-colors hover:text-black"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-4 lg:flex xl:gap-6">
          <div className="relative w-full max-w-xs">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Find your style..."
              className="w-full rounded-full border-none bg-gray-50 py-2.5 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:ring-2 focus:ring-[#facc15]/50"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/design')}
            className="shrink-0 rounded-lg bg-[#facc15] px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-black shadow-md transition-all hover:bg-black hover:text-white"
          >
            Design Now
          </button>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all hover:text-red-500"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="shrink-0 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all hover:text-[#facc15]"
            >
              Sign In
            </Link>
          )}

          <div className="flex shrink-0 items-center gap-4 text-gray-400">
            <button
              type="button"
              onClick={() => navigate('/design')}
              aria-label="Open favorites"
            >
              <span className="material-symbols-outlined transition-colors hover:text-black">
                favorite
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/design?openCart=true')}
              className="relative"
              aria-label="Open shopping bag"
            >
              <span className="material-symbols-outlined transition-colors hover:text-black">
                shopping_bag
              </span>
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[8px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(isLoggedIn ? '/my-designs' : '/login')}
              aria-label="Open account"
            >
              <span className="material-symbols-outlined transition-colors hover:text-black">
                person
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={() => navigate('/design?openCart=true')}
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Open shopping bag"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[8px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="material-symbols-outlined">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-5 shadow-lg lg:hidden">
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.sectionId}
                href={`/home#${item.sectionId}`}
                onClick={(event) => handleNavClick(event, item.sectionId)}
                className="border-b border-gray-100 py-4 text-xs font-black uppercase tracking-widest text-gray-600"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/design');
              }}
              className="rounded-xl bg-[#facc15] px-4 py-3 text-[10px] font-black uppercase tracking-widest"
            >
              Design Now
            </button>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-red-200 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-xl border border-gray-200 px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest"
              >
                Sign In
              </Link>
            )}
          </div>

          {isLoggedIn && (
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/my-designs');
              }}
              className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-[10px] font-black uppercase tracking-widest"
            >
              My Designs
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
