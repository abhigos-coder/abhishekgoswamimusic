'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, MailOpen, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { ContactMessage } from '@/types/database';

interface Props {
  initialMessages: ContactMessage[];
}

export default function MessageList({ initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleToggleRead = async (msg: ContactMessage) => {
    if (loadingId) return;
    setLoadingId(msg.id);

    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, is_read: !msg.is_read }),
      });
      if (!res.ok) throw new Error();

      setMessages(
        messages.map((m) => (m.id === msg.id ? { ...m, is_read: !m.is_read } : m))
      );
      router.refresh();
    } catch {
      toast.error('Failed to update');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (loadingId) return;
    if (!confirm('Delete this message?')) return;

    setLoadingId(id);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();

      setMessages(messages.filter((m) => m.id !== id));
      toast.success('Deleted');
      router.refresh();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setLoadingId(null);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-16 bg-surface rounded-xl border border-border">
        <p className="text-text-muted">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((msg) => {
        const isLoading = loadingId === msg.id;

        return (
          <div
            key={msg.id}
            className={`bg-surface rounded-lg border border-border ${
              !msg.is_read ? 'border-l-4 border-l-primary' : ''
            }`}
          >
            <div
              className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
            >
              {msg.is_read ? (
                <MailOpen className="w-4 h-4 text-text-muted flex-shrink-0" />
              ) : (
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text">{msg.name}</p>
                  {!msg.is_read && <Badge variant="default">New</Badge>}
                </div>
                <p className="text-xs text-text-muted">{msg.email}</p>
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {new Date(msg.created_at).toLocaleDateString('en-IN')}
              </span>
              {expandedId === msg.id ? (
                <ChevronUp className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              )}
            </div>

            {expandedId === msg.id && (
              <div className="px-4 pb-4 border-t border-border pt-3">
                <p className="text-sm text-text whitespace-pre-wrap mb-4">{msg.message}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleRead(msg)}
                    disabled={isLoading}
                    className="text-xs text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : `Mark as ${msg.is_read ? 'unread' : 'read'}`}
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    disabled={isLoading}
                    className="text-xs text-danger hover:text-danger/80 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
