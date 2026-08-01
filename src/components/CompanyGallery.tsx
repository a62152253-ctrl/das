import React, { useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

interface Props {
  gallery?: string[];
  onUpdateGallery: (updated: string[]) => void;
}

export function CompanyGallery({ gallery = [], onUpdateGallery }: Props) {
  const [newUrl, setNewUrl] = useState('');

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    onUpdateGallery([...gallery, newUrl.trim()]);
    setNewUrl('');
  };

  const handleDeletePhoto = (idxToRemove: number) => {
    onUpdateGallery(gallery.filter((_, idx) => idx !== idxToRemove));
  };

  return (
    <div className="font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Galeria realizacji</h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Uzupełnij portfolio realizacjami, aby przyciągnąć uwagę klientów w wynikach wyszukiwania.</p>
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
          <h4 className="font-bold text-slate-900 text-sm">Zdjęcia w galerii ({gallery.length})</h4>
          {gallery.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200/60 rounded-2xl text-slate-400 font-semibold text-xs">
              Brak zdjęć w galerii. Uzupełnij portfolio powyżej!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video shadow-xs transition-transform duration-200 hover:scale-[1.02]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(idx)}
                      className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
                      title="Usuń zdjęcie"
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
    </div>
  );
}
