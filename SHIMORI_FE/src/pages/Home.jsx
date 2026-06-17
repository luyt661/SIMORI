import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { PRODUCTS } from '../data/products';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace('#', '');
    const element = document.getElementById(id);

    if (element) {
      const timer = window.setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [location.hash]);

  const handleProductClick = (item) => {
    let setting = 'Prong';

    if (item.id === 2) setting = 'Halo';
    else if (item.id === 3) setting = 'Channel';

    navigate(`/design?setting=${setting}`);
  };

  const steps = [
    { icon: 'token', title: 'Select', desc: 'Choose your base metal and stone type.' },
    { icon: 'Auto_Fix', title: 'Customize', desc: 'Adjust band width and textures in 3D.' },
    { icon: 'visibility', title: 'Preview', desc: 'View your masterpiece in ultra-high definition.' },
    { icon: 'shopping_cart', title: 'Order', desc: 'Handcrafted and delivered to your door.' },
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-['Manrope'] text-slate-900">
      <Navbar />

      <section className="relative flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center overflow-hidden lg:h-[85vh] lg:min-h-0">
        <div className="absolute inset-0 z-0">
          <img
            alt="High-resolution cinematic jewelry"
            className="h-full w-full scale-105 object-cover animate-slow-zoom"
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=70&w=1200&auto=format&fit=crop"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/70" />
        </div>

        <div className="relative z-20 w-full max-w-5xl px-4 py-12 text-center sm:px-6">
          <h1 className="mb-6 text-4xl font-extrabold leading-[1.02] tracking-tighter text-white drop-shadow-2xl sm:text-5xl md:text-7xl lg:mb-8 lg:text-[90px]">
            Custom Jewelry <br />
            <span className="serif font-light italic text-[#facc15]">
              Design Your Story
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-sm font-medium leading-relaxed text-gray-200 opacity-90 sm:text-lg md:text-xl lg:mb-12">
            Experience the art of 3D jewelry design. Craft a piece as unique as your journey with our immersive high-definition studio.
          </p>

          <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-5">
            <button
              type="button"
              onClick={() => navigate('/design')}
              className="w-full rounded-2xl bg-[#facc15] px-6 py-4 text-xs font-black uppercase tracking-widest text-black shadow-2xl transition-all hover:-translate-y-1 hover:bg-white sm:w-auto sm:px-12 sm:py-5 sm:text-sm"
            >
              Start Designing
            </button>

            <button
              type="button"
              onClick={() => navigate('/my-designs')}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/20 sm:w-auto sm:px-12 sm:py-5 sm:text-sm"
            >
              My Designs
            </button>
          </div>
        </div>
      </section>

      <section id="collections" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 flex flex-col items-start justify-between gap-5 sm:mb-16 md:flex-row md:items-end">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#facc15]">
              Exquisite Selection
            </span>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl">
              Featured Collection
            </h2>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#facc15] transition-all hover:gap-4"
          >
            Shop All Collections
            <span className="material-symbols-outlined">arrow_right_alt</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {PRODUCTS.map((item) => (
            <article
              key={item.id}
              className="group cursor-pointer"
              onClick={() => handleProductClick(item)}
            >
              <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-xl sm:mb-6">
                <img
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={item.image}
                />

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleProductClick(item);
                  }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-0 rounded-full bg-white px-5 py-3 text-[10px] font-black uppercase text-black opacity-100 shadow-lg transition-all sm:bottom-6 sm:translate-y-4 sm:px-6 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
                >
                  Customize
                </button>
              </div>

              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm font-bold uppercase tracking-widest text-[#facc15]">
                From {item.price}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="process" className="scroll-mt-20 border-y border-gray-100 bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl lg:mb-20">
            How It Works
          </h2>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {steps.map((step) => (
              <div key={step.title} className="group flex flex-col items-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-100 bg-white text-[#facc15] shadow-xl transition-all group-hover:bg-[#facc15] group-hover:text-black sm:mb-8 sm:h-20 sm:w-20">
                  <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                </div>
                <h3 className="mb-3 text-sm font-black uppercase tracking-widest sm:mb-4">
                  {step.title}
                </h3>
                <p className="max-w-[220px] text-xs leading-relaxed text-gray-500 sm:max-w-[180px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#facc15]">
              Our Story
            </span>
            <h2 className="mb-6 mt-4 text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-4xl lg:mb-8">
              About SHIMORI
            </h2>
            <p className="mb-5 text-base leading-relaxed text-gray-600 sm:text-lg lg:mb-6">
              SHIMORI is redefining luxury jewelry through the fusion of traditional craftsmanship and cutting-edge 3D technology. We believe every piece tells a unique story.
            </p>
            <p className="mb-8 text-base leading-relaxed text-gray-600 sm:text-lg">
              Our artisans bring decades of expertise to create heirloom-quality pieces while our immersive 3D studio empowers you to design exactly what you envision. From initial concept to final masterpiece, we&apos;re with you every step of the way.
            </p>
            <button
              type="button"
              className="rounded-lg bg-[#facc15] px-8 py-3 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-black hover:text-[#facc15]"
            >
              Learn More
            </button>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=70&w=800&auto=format&fit=crop"
              alt="About SHIMORI"
              loading="lazy"
              className="w-full rounded-3xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 -z-10 h-36 w-36 rounded-full bg-[#facc15]/20 blur-3xl sm:h-48 sm:w-48" />
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-gray-100 px-4 py-10 text-center sm:py-12">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 sm:text-[10px] sm:tracking-[0.3em]">
          © 2026 SHIMORI UNIFIED STUDIO
        </p>
      </footer>
    </div>
  );
};

export default Home;
