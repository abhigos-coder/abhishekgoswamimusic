'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import YouTubePreview from '@/components/admin/YouTubePreview';
import { getYouTubeId, type CourseVideo } from '@/types/database';

interface Props {
  courseId: string;
  initialVideos: CourseVideo[];
}

export default function VideoManager({ courseId, initialVideos }: Props) {
  const [videos, setVideos] = useState(initialVideos);
  const [showForm, setShowForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editPreview, setEditPreview] = useState(false);
  const router = useRouter();

  const startEdit = (video: CourseVideo) => {
    setEditingId(video.id);
    setEditTitle(video.title);
    setEditUrl(video.youtube_url);
    setEditDuration(video.duration_minutes ? String(video.duration_minutes) : '');
    setEditPreview(video.is_preview);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleEdit = async (video: CourseVideo) => {
    if (!getYouTubeId(editUrl)) {
      toast.error('Invalid YouTube URL.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/videos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          title: editTitle,
          youtube_url: editUrl,
          sort_order: video.sort_order,
          is_preview: editPreview,
          duration_minutes: editDuration ? parseInt(editDuration) : null,
        }),
      });

      if (!res.ok) throw new Error('Failed to update video');

      const updated = await res.json();
      setVideos(videos.map((v) => (v.id === video.id ? updated : v)));
      setEditingId(null);
      toast.success('Video updated!');
      router.refresh();
    } catch {
      toast.error('Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const youtubeUrl = formData.get('youtube_url') as string;

    if (!getYouTubeId(youtubeUrl)) {
      toast.error('Invalid YouTube URL. Please enter a valid YouTube link.');
      return;
    }

    setLoading(true);

    const data = {
      title: formData.get('title') as string,
      youtube_url: youtubeUrl,
      sort_order: Math.max(...videos.map((v) => v.sort_order), -1) + 1,
      is_preview: formData.get('is_preview') === 'on',
      duration_minutes: formData.get('duration')
        ? parseInt(formData.get('duration') as string)
        : null,
    };

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to add video');

      const newVideo = await res.json();
      setVideos([...videos, newVideo]);
      setShowForm(false);
      setNewUrl('');
      (e.target as HTMLFormElement).reset();
      toast.success('Video added!');
      router.refresh();
    } catch {
      toast.error('Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Delete this video?')) return;

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/videos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });

      if (!res.ok) throw new Error('Failed to delete');

      setVideos(videos.filter((v) => v.id !== videoId));
      if (expandedId === videoId) setExpandedId(null);
      toast.success('Video deleted');
      router.refresh();
    } catch {
      toast.error('Failed to delete video');
    }
  };

  return (
    <div className="space-y-4">
      {/* Video list with inline previews */}
      {videos.length > 0 ? (
        <div className="space-y-2">
          {videos.map((video, index) => {
            const isExpanded = expandedId === video.id;
            const isEditing = editingId === video.id;
            const ytId = getYouTubeId(isEditing ? editUrl : video.youtube_url);

            return (
              <div
                key={video.id}
                className="border border-border rounded-lg overflow-hidden"
              >
                {isEditing ? (
                  /* Edit mode */
                  <div className="px-4 py-3 space-y-4 bg-background">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-text-dim w-6">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="label-mono">Editing</h3>
                    </div>

                    <YouTubePreview url={editUrl} />

                    <Input
                      id={`edit-title-${video.id}`}
                      label="Video Title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      required
                    />
                    <Input
                      id={`edit-url-${video.id}`}
                      label="YouTube URL"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        id={`edit-duration-${video.id}`}
                        type="number"
                        label="Duration (minutes)"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        min="1"
                      />
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editPreview}
                            onChange={(e) => setEditPreview(e.target.checked)}
                            className="w-4 h-4 rounded border-border bg-surface text-primary"
                          />
                          Free preview
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={loading}
                        onClick={() => handleEdit(video)}
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header row */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-background">
                      <span className="text-xs font-mono text-text-dim w-6">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : video.id)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <p className="text-sm font-medium text-text truncate">{video.title}</p>
                        <p className="text-xs text-text-dim truncate">{video.youtube_url}</p>
                      </button>
                      {video.is_preview && <Badge variant="default">Preview</Badge>}
                      {video.duration_minutes && (
                        <span className="text-xs text-text-dim">{video.duration_minutes}m</span>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : video.id)}
                        className="text-text-dim hover:text-text transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => startEdit(video)}
                        aria-label={`Edit video: ${video.title}`}
                        className="p-1.5 text-text-dim hover:text-primary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        aria-label={`Delete video: ${video.title}`}
                        className="p-1.5 text-text-dim hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expanded preview */}
                    {isExpanded && (
                      <div className="border-t border-border p-4 bg-surface">
                        <div className="max-w-lg">
                          <div className="aspect-video rounded-lg overflow-hidden border border-border">
                            <iframe
                              src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                              title={video.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                          <p className="text-xs text-text-dim mt-3">
                            {video.is_preview
                              ? 'Marked as preview — title visible to all, video plays only for purchasers.'
                              : 'Locked — only visible to users who purchased this course.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center border border-border rounded-lg">
          <p className="text-sm text-text-dim">No videos yet. Add your first lesson below.</p>
        </div>
      )}

      {/* Add video form with live preview */}
      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="border border-border rounded-lg p-5 space-y-4"
        >
          <h3 className="label-mono">Add Lesson</h3>

          {/* Live preview */}
          <YouTubePreview url={newUrl} />

          <Input
            id="title"
            name="title"
            label="Video Title"
            placeholder="e.g., Lesson 1 — Introduction"
            required
          />
          <Input
            id="youtube_url"
            name="youtube_url"
            label="YouTube URL (unlisted)"
            placeholder="https://www.youtube.com/watch?v=..."
            required
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="duration"
              name="duration"
              type="number"
              label="Duration (minutes)"
              placeholder="e.g., 15"
              min="1"
            />
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
                <input
                  type="checkbox"
                  name="is_preview"
                  className="w-4 h-4 rounded border-border bg-surface text-primary"
                />
                Free preview
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? 'Adding...' : 'Add Video'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setNewUrl('');
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Video
        </Button>
      )}
    </div>
  );
}
