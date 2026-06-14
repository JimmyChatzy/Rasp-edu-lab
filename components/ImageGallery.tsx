"use client";

import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const closeModal = () => setSelectedIndex(null);
  const prev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  };
  const next = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((src, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="overflow-hidden rounded border border-slate-200 transition-opacity hover:opacity-80"
          >
            <img
              src={src}
              alt={`Εικόνα ${index + 1}`}
              className="h-32 w-full object-cover"
            />
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-800 shadow-md"
            >
              ✕
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-xl font-bold text-slate-800 shadow-md hover:bg-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-xl font-bold text-slate-800 shadow-md hover:bg-white"
                >
                  ›
                </button>
              </>
            )}

            <img
              src={images[selectedIndex]}
              alt={`Εικόνα ${selectedIndex + 1}`}
              className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
            />

            <p className="mt-2 text-center text-sm text-white">
              {selectedIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}