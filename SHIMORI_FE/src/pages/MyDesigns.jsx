import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const MyDesigns = () => {
  const navigate = useNavigate();

  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await api.get('/designs/my-drafts');
        setDesigns(res.data || []);
      } catch (err) {
        console.error(err);
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
    <div className="min-h-screen bg-[#f8f8f8] text-[#1a1a1a]">
      <Toaster position="bottom-right" />

      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-10">
        <div
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl text-[#b08d26]">
            diamond
          </span>
          <h1 className="text-xl font-black tracking-tight">SHIMORI</h1>
        </div>

        <button
          onClick={() => navigate('/design')}
          className="bg-[#b08d26] text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition"
        >
          New Design
        </button>
      </header>

      <main className="px-10 py-10">
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#b08d26] mb-2">
            Personal Workspace
          </p>
          <h2 className="text-4xl font-black tracking-tight">
            My Designs
          </h2>
          <p className="text-gray-500 mt-2">
            Các thiết kế autosave gần đây của bạn.
          </p>
        </div>

        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#b08d26] border-t-transparent rounded-full" />
          </div>
        ) : designs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
              inventory_2
            </span>
            <h3 className="text-xl font-black uppercase mb-2">
              Chưa có thiết kế nào
            </h3>
            <p className="text-gray-400 mb-8">
              Hãy bắt đầu tạo một mẫu nhẫn mới.
            </p>
            <button
              onClick={() => navigate('/design')}
              className="bg-black text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#b08d26] transition"
            >
              Start Designing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {designs.map((design) => {
              const config = (() => {
                try {
                  return JSON.parse(design.configurationJson || '{}');
                } catch {
                  return {};
                }
              })();

              return (
                <div
                  key={design.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#b08d26] transition overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-7xl text-[#b08d26]">
                      diamond
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          Draft #{design.id}
                        </p>
                        <h3 className="text-lg font-black uppercase mt-1">
                          Custom Ring
                        </h3>
                      </div>

                      <span className="bg-yellow-50 text-[#b08d26] px-3 py-1 rounded-full text-[8px] font-black uppercase">
                        {design.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] uppercase font-bold text-gray-500 mb-6">
                      <div>
                        Material:
                        <span className="block text-black font-black">
                          {design.material?.name || config.material || 'N/A'}
                        </span>
                      </div>

                      <div>
                        Gemstone:
                        <span className="block text-black font-black">
                          {design.gemstone?.name || config.gemstone || 'N/A'}
                        </span>
                      </div>

                      <div>
                        Setting:
                        <span className="block text-black font-black">
                          {design.setting?.name || config.setting || 'N/A'}
                        </span>
                      </div>

                      <div>
                        Width:
                        <span className="block text-black font-black">
                          {design.bandWidth || config.width || 'N/A'} mm
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                      <div>
                        <p className="text-[8px] uppercase font-black text-gray-400">
                          Total
                        </p>
                        <p className="text-xl font-black text-[#b08d26]">
                          ${Number(design.totalPrice || 0).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => openDesign(design.id)}
                        className="bg-black text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#b08d26] transition"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyDesigns;