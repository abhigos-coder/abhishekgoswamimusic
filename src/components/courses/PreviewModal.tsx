'use client';

import { useState } from 'react';
import { X, PlayCircle } from 'lucide-react';

interface PreviewVideo {
  id: string;
  title: string;
  ytId: string;
}

interface Props {
  videos: PreviewVideo[];
}

export default function PreviewModal({ videos }: Props) {
  const [activeVideo, setActiveVideo] = useState<PreviewVideo | null>(null);

  if (videos.length === 0) return null;

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {videos.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveVideo(v)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg text-primary hover:border-primary hover:bg-surface transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            Watch Preview: {v.title}
          </button>
        ))}
      </div>

      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.ytId}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <p className="text-sm text-white/80 mt-3 text-center">{activeVideo.title}</p>
          </div>
        </div>
      )}
    </>
  );
}
