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
    <div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Galeria realizacji</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleAddPhoto} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4 h-fit">
          <h4 className="font-extrabold text-slate-900">Dodaj zdjęcie do galerii</h4>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Adres URL zdjęcia</label>
            <input 
              type="url"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-3 border border-slate-200 bg-white rounded-xl focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl transition-colors cursor-pointer"
          >
            <ImagePlus className="w-4 h-4" />
            Dodaj zdjęcie
          </button>
        </form>

        <div className="lg:col-span-2">
          <h4 className="font-extrabold text-slate-900 mb-4">Zdjęcia w galerii ({gallery.length})</h4>
          {gallery.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-400">
              Brak zdjęć w galerii. Uzupełnij portfolio, aby przyciągnąć klientów.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map((url, idx) => (
                <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-video shadow-sm">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(idx)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer"
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
