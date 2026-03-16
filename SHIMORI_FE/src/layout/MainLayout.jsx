import { Link } from 'react-router-dom';

const MainLayout = ({ children }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-3xl">diamond</span>
                <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight">SHIMORI</h2>
              </Link>
              <nav className="hidden md:flex items-center gap-8">
                <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" to="/">Collections</Link>
                <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" to="/">Process</Link>
                <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" to="/about">About</Link>
                <Link className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors" to="/">Bespoke</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-primary/5">
                <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                <input className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 w-32 lg:w-48" placeholder="Find your style..." type="text" />
              </div>
              <Link to="/login" className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors px-3 py-2">
                Sign In
              </Link>
              <button className="bg-primary hover:bg-primary/90 text-slate-950 px-5 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105">
                Design Now
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main>{children}</main>

      {/* FOOTER */}
      <footer className="bg-background-light dark:bg-background-dark border-t border-primary/10 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 text-primary mb-6">
                <span className="material-symbols-outlined text-3xl">diamond</span>
                <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold tracking-tight">SHIMORI</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                Redefining the luxury jewelry experience through digital innovation and traditional master craftsmanship.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-6 uppercase text-xs tracking-widest">Shop</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <li><Link className="hover:text-primary transition-colors" to="/">Engagement Rings</Link></li>
                <li><Link className="hover:text-primary transition-colors" to="/">Wedding Bands</Link></li>
              </ul>
            </div>
            {/* ... Bạn có thể thêm các cột khác tương tự ... */}
          </div>
          <div className="pt-10 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-slate-500">© 2024 SHIMORI Custom Jewelry. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;