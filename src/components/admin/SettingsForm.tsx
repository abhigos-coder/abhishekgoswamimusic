'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import type { SiteSettings } from '@/types/database';

interface Props {
  settings: SiteSettings;
}

export default function SettingsForm({ settings }: Props) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    settings.about_image_url || null
  );
  const [bio, setBio] = useState(settings.about_bio || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2 MB.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function uploadImage(file: File): Promise<string> {
    const body = new FormData();
    body.append('file', file);

    const res = await fetch('/api/admin/upload', { method: 'POST', body });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Upload failed');
    }
    const { url } = await res.json();
    return url;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      let aboutImageUrl: string | null = imagePreview;

      if (imageFile) {
        aboutImageUrl = await uploadImage(imageFile);
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          about_image_url: aboutImageUrl,
          about_bio: bio || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      toast.success('Settings saved!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image upload */}
      <div>
        <span className="block text-sm font-medium text-text mb-1.5">
          About Page Image
        </span>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="block text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90 file:cursor-pointer"
        />
        <span className="text-xs text-text-muted mt-1 block">
          Recommended: 1200x1200px square. JPEG, PNG, or WebP (max 2 MB)
        </span>

        {imagePreview && (
          <div className="relative inline-block mt-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="About image preview"
              width={280}
              height={280}
              className="rounded-lg border border-border object-cover aspect-square max-w-[280px]"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Bio textarea */}
      <Textarea
        id="about_bio"
        label="About Bio"
        placeholder="Write a short bio for the About page..."
        rows={6}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <div className="pt-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
