'use client';

import { useState } from 'react';
import { PlayCircle, CheckCircle } from 'lucide-react';
import { getYouTubeId, type CourseVideo } from '@/types/database';

interface Props {
  videos: CourseVideo[];
  courseTitle: string;
}

export default function CoursePlayer({ videos }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (videos.length === 0) {
    return (
      <div className="py-20 text-center border border-border rounded-lg">
        <p className="text-sm text-text-dim">No videos available yet.</p>
      </div>
    );
  }

  const activeVideo = videos[activeIndex];
  const ytId = getYouTubeId(activeVideo.youtube_url);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video player */}
      <div className="lg:col-span-2">
        <div className="aspect-video bg-black rounded-lg overflow-hidden border border-border">
          {ytId ? (
            <iframe
              key={activeVideo.id}
              src={`https://www.youtube-nocookie.com/embed/${ytId}`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-dim">
              <p className="text-sm">Invalid video URL</p>
            </div>
          )}
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-text">{activeVideo.title}</h2>
          <p className="text-xs text-text-dim mt-1">
            Lesson {activeIndex + 1} of {videos.length}
          </p>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <p className="label-mono mb-3">Lessons</p>
        <div className="space-y-1 max-h-64 lg:max-h-[calc(100vh-16rem)] overflow-y-auto border border-border rounded-lg divide-y divide-border">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => setActiveIndex(index)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                index === activeIndex
                  ? 'bg-surface text-primary'
                  : 'text-text-muted hover:bg-surface hover:text-text'
              }`}
            >
              <span className="flex-shrink-0">
                {index < activeIndex ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm truncate">{video.title}</p>
                {video.duration_minutes && (
                  <p className="text-xs text-text-dim">{video.duration_minutes} min</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
