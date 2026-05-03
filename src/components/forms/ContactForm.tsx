'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to send message');

      toast.success('Message sent!');
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input id="name" name="name" label="Name" placeholder="Your name" required />
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="your@email.com"
        required
      />
      <Textarea
        id="message"
        name="message"
        label="Message"
        placeholder="What would you like to say?"
        rows={5}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full px-5 py-3 bg-primary text-background text-sm font-medium rounded hover:bg-primary-hover transition-colors disabled:opacity-40"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
