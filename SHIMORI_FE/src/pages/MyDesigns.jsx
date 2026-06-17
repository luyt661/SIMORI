import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../api/axios';

const MyDesigns = () => {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await api.get('/designs/my-drafts');
        setDesigns(response.data || []);
      } catch (error) {
        console.error(error);
        toast.error('Không tải được danh sách thiết kế.');
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  const openDesign = (id) => {
    navigate(`/design?designId=${id}`);
  };

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#f8f8f8] text-[#1a1a1a]">
      <Toaster position="bottom-right" />

      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-2 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex min-w-0 items-center gap-2"
        >
          <span className="material-symbols-outlined shrink-0 text-2xl text-[#b08d26]">
            diamond
          </span>
          <span className="truncate text-lg font-black tracking-tight sm:text-xl">
            SHIMORI
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/design')}
          className="shrink-0 rounded-lg bg-[#b08d26] px-3 py-2 text-[9px] font-black uppercase tracking-wider text-white transition hover:bg-black sm:px-5 sm:text-[10px] sm:tracking-widest"
        >
          <span className="sm:hidden">New</span>
          <span className="hidden sm:inline">New Design</span>
        </button>
      </header>

      <main className="px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
        <div className="mb-7 sm:mb-10">
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#b08d26] sm:text-[10px] sm:tracking-[0.25em]">
            Personal Workspace
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            My Designs
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Các thiết kế autosave gần đây của bạn.
          </p>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#b08d26] border-t-transparent" />
          </div>
        ) : designs.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center sm:p-16">
            <span className="material-symbols-outlined mb-4 text-5xl text-gray-300 sm:text-6xl">
              inventory_2
            </span>
            <h2 className="mb-2 text-lg font-black uppercase sm:text-xl">
              Chưa có thiết kế nào
            </h2>
            <p className="mb-7 text-sm text-gray-400 sm:mb-8 sm:text-base">
              Hãy bắt đầu tạo một mẫu nhẫn mới.
            </p>
            <button
              type="button"
              onClick={() => navigate('/design')}
              className="rounded-xl bg-black px-6 py-3 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-[#b08d26] sm:px-8 sm:py-4 sm:text-[10px]"
            >
              Start Designing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {designs.map((design) => {
              const config = (() => {
                try {
                  return JSON.parse(design.configurationJson || '{}');
                } catch {
                  return {};
                }
              })();

              return (
                <article
                  key={design.id}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:border-[#b08d26] hover:shadow-xl"
                >
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 sm:h-48">
                    <span className="material-symbols-outlined text-6xl text-[#b08d26] sm:text-7xl">
                      diamond
                    </span>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          Draft #{design.id}
                        </p>
                        <h2 className="mt-1 truncate text-base font-black uppercase sm:text-lg">
                          Custom Ring
                        </h2>
                      </div>

                      <span className="shrink-0 rounded-full bg-yellow-50 px-3 py-1 text-[8px] font-black uppercase text-[#b08d26]">
                        {design.status}
                      </span>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-3 text-[9px] font-bold uppercase text-gray-500 sm:text-[10px]">
                      <div className="min-w-0">
                        Material:
                        <span className="block truncate font-black text-black">
                          {design.material?.name || config.material || 'N/A'}
                        </span>
                      </div>

                      <div className="min-w-0">
                        Gemstone:
                        <span className="block truncate font-black text-black">
                          {design.gemstone?.name || config.gemstone || 'N/A'}
                        </span>
                      </div>

                      <div className="min-w-0">
                        Setting:
                        <span className="block truncate font-black text-black">
                          {design.setting?.name || config.setting || 'N/A'}
                        </span>
                      </div>

                      <div>
                        Width:
                        <span className="block font-black text-black">
                          {design.bandWidth || config.width || 'N/A'} mm
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[8px] font-black uppercase text-gray-400">
                          Total
                        </p>
                        <p className="text-xl font-black text-[#b08d26]">
                          ${Number(design.totalPrice || 0).toLocaleString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openDesign(design.id)}
                        className="w-full rounded-xl bg-black px-5 py-3 text-[9px] font-black uppercase tracking-widest text-white transition hover:bg-[#b08d26] sm:w-auto"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyDesigns;
