import React, { useState } from 'react';
import { ImagePlus, Trash2, Image, Grid3x3, List, Star, Download, ZoomIn, X, Upload, Sparkles } from 'lucide-react';

interface Props {
  gallery?: string[];
  onUpdateGallery: (updated: string[]) => void;
}

export function CompanyGallery({ gallery = [], onUpdateGallery }: Props) {
  const [newUrl, setNewUrl] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    onUpdateGallery([...gallery, newUrl.trim()]);
    setNewUrl('');
  };

  const handleDeletePhoto = (idxToRemove: number) => {
    onUpdateGallery(gallery.filter((_, idx) => idx !== idxToRemove));
    if (selectedImage === gallery[idxToRemove]) setSelectedImage(null);
  };

  // ✨ NOWA FUNKCJA 1: Set Featured Image (move to first position)
  const handleSetFeatured = (idx: number) => {
    const newGallery = [...gallery];
    const [featured] = newGallery.splice(idx, 1);
    newGallery.unshift(featured);
    onUpdateGallery(newGallery);
    setFeaturedIndex(0);
  };

  // ✨ NOWA FUNKCJA 2: Bulk Upload Simulation
  const handleBulkUpload = (urls: string[]) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        onUpdateGallery([...gallery, ...urls]);
        setUploadProgress(0);
      }
    }, 300);
  };

  // ✨ NOWA FUNKCJA 3: Download All Images (simulated)
  const handleDownloadAll = () => {
    alert(`Pobieranie ${gallery.length} zdjęć z galerii... (symulacja)`);
  };

  // ✨ NOWA FUNKCJA 4: Lightbox View
  const openLightbox = (url: string) => {
    setSelectedImage(url);
  };

  // ✨ NOWA FUNKCJA 5: Reorder Gallery (move up/down)
  const handleMoveImage = (idx: number, direction: 'up' | 'down') => {
    const newGallery = [...gallery];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= gallery.length) return;
    [newGallery[idx], newGallery[targetIdx]] = [newGallery[targetIdx], newGallery[idx]];
    onUpdateGallery(newGallery);
  };

  return (
    <div className="font-sans">\n      {/* Header with stats and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Image className="w-5 h-5 text-indigo-600" />
            Galeria realizacji
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Uzupełnij portfolio realizacjami, aby przyciągnąć uwagę klientów w wynikach wyszukiwania.</p>
        </div>
        <div className="flex items-center gap-2">
          {gallery.length > 0 && (
            <>
              <button
                onClick={handleDownloadAll}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Pobierz wszystko
              </button>
              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow-2xs' : 'hover:bg-slate-50'}`}
                  title="Widok siatki"
                >
                  <Grid3x3 className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow-2xs' : 'hover:bg-slate-50'}`}
                  title="Widok listy"
                >
                  <List className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form left */}
        <form onSubmit={handleAddPhoto} className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl space-y-4 h-fit">
          <h4 className="font-bold text-slate-900 text-sm mb-3">Dodaj zdjęcie do galerii</h4>
          <div>
            <label className="notion-label">Adres URL zdjęcia</label>
            <input 
              type="url"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="notion-input bg-white border border-slate-200"
            />
          </div>
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-lg shadow-md shadow-indigo-600/10 transition-colors cursor-pointer text-xs"
          >
            <ImagePlus className="w-4 h-4" />
            Dodaj zdjęcie
          </button>
        </form>

        {/* Gallery grid right */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Zdjęcia w galerii ({gallery.length})</h4>
            {uploadProgress > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-indigo-600">{uploadProgress}%</span>
              </div>
            )}
          </div>

          {gallery.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200/60 rounded-2xl text-slate-400 font-semibold text-xs">
              Brak zdjęć w galerii. Uzupełnij portfolio powyżej!
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map((url, idx) => (
                <div 
                  key={idx} 
                  className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video shadow-xs transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  
                  {/* Featured badge */}
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold uppercase rounded-md shadow-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Wyróżnione
                    </div>
                  )}

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openLightbox(url)}
                        className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-lg transition-colors cursor-pointer shadow-sm"
                        title="Powiększ"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetFeatured(idx)}
                          className="p-2 bg-amber-500/90 hover:bg-amber-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                          title="Ustaw jako wyróżnione"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(idx)}
                        className="p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                        title="Usuń zdjęcie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {gallery.map((url, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Zdjęcie {idx + 1}</p>
                    <p className="text-[10px] text-slate-400 font-semibold truncate">{url}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {idx > 0 && (
                      <button
                        onClick={() => handleMoveImage(idx, 'up')}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="Przesuń w górę"
                      >
                        ↑
                      </button>
                    )}
                    {idx < gallery.length - 1 && (
                      <button
                        onClick={() => handleMoveImage(idx, 'down')}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="Przesuń w dół"
                      >
                        ↓
                      </button>
                    )}
                    {idx !== 0 && (
                      <button
                        onClick={() => handleSetFeatured(idx)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded transition-colors"
                        title="Wyróżnij"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Usuń"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✨ Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={selectedImage} 
            alt="Podgląd" 
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
