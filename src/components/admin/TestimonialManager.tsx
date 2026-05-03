'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { Testimonial } from '@/types/database';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

interface Props {
  initialTestimonials: Testimonial[];
}

export default function TestimonialManager({ initialTestimonials }: Props) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again
    e.target.value = '';

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error('File too large. Maximum size is 2 MB.');
      return;
    }

    setUploading(true);

    try {
      // Step 1: Upload the file
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Upload failed');
      }

      const { url } = await uploadRes.json();

      // Step 2: Create the testimonial record
      const nextOrder = testimonials.length > 0
        ? Math.max(...testimonials.map((t) => t.sort_order)) + 1
        : 0;

      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, sort_order: nextOrder }),
      });

      if (!res.ok) throw new Error('Failed to save testimonial');

      const newTestimonial = await res.json();
      setTestimonials([...testimonials, newTestimonial]);
      toast.success('Testimonial added!');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add testimonial');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to delete');

      setTestimonials(testimonials.filter((t) => t.id !== id));
      toast.success('Testimonial deleted');
      router.refresh();
    } catch {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= testimonials.length) return;

    const updated = [...testimonials];
    const temp = updated[index].sort_order;
    updated[index] = { ...updated[index], sort_order: updated[swapIndex].sort_order };
    updated[swapIndex] = { ...updated[swapIndex], sort_order: temp };

    // Swap positions in the array
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];

    // Optimistic update
    const previous = testimonials;
    setTestimonials(updated);

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: updated[index].id, sort_order: updated[index].sort_order },
            { id: updated[swapIndex].id, sort_order: updated[swapIndex].sort_order },
          ],
        }),
      });

      if (!res.ok) throw new Error('Failed to reorder');
      router.refresh();
    } catch {
      // Rollback
      setTestimonials(previous);
      toast.error('Failed to reorder');
    }
  };

  return (
    <div className="space-y-6">
      {testimonials.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="group relative aspect-[3/4] rounded-lg border border-border bg-surface overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={testimonial.image_url}
                alt={`Testimonial ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleReorder(index, 'up')}
                  disabled={index === 0}
                  className="p-2 rounded bg-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReorder(index, 'down')}
                  disabled={index === testimonials.length - 1}
                  className="p-2 rounded bg-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="p-2 rounded bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center border border-border rounded-lg">
          <p className="text-sm text-text-dim">
            No testimonials yet. Upload your first screenshot below.
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="outline"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        <Plus className="w-4 h-4 mr-1.5" />
        {uploading ? 'Uploading...' : 'Add Testimonial'}
      </Button>
    </div>
  );
}
