'use client';

import { useState, useEffect } from 'react';
import { getYouTubeId } from '@/types/database';

interface Props {
  url: string;
}

export default function YouTubePreview({ url }: Props) {
  const [ytId, setYtId] = useState<string | null>(null);

  useEffect(() => {
    setYtId(url ? getYouTubeId(url) : null);
  }, [url]);

  if (!ytId) {
    return (
      <div className="aspect-video rounded-lg border border-border bg-surface flex items-center justify-center">
        <p className="text-xs text-text-dim">Paste a YouTube URL to preview</p>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg border border-border overflow-hidden">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${ytId}`}
        title="Video preview"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
