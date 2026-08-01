// Przykład komponentu React do wysyłania wiadomości

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase'; // Twój auth hook
import { sendMessage, checkRateLimit } from '@/functions/messageService';

export function MessageForm() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    isLimited: boolean;
    blockedUntil: Date | null;
  } | null>(null);

  // Sprawdź rate limit na montażu i periodycznie
  useEffect(() => {
    const checkLimit = async () => {
      if (user?.uid) {
        const info = await checkRateLimit(user.uid);
        setRateLimitInfo(info);
      }
    };

    checkLimit();
    const interval = setInterval(checkLimit, 2000);
    return () => clearInterval(interval);
  }, [user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      setError('Musisz być zalogowany');
      return;
    }

    if (rateLimitInfo?.isLimited) {
      const secondsLeft = Math.ceil(
        (rateLimitInfo.blockedUntil!.getTime() - Date.now()) / 1000
      );
      setError(`Czekaj ${secondsLeft}s - zbyt dużo wiadomości`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await sendMessage({
        userId: user.uid,
        text,
      });

      setText('');
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Błąd wysyłania';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (rateLimitInfo?.isLimited) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 rounded">
        ⏱️ Rate limit aktywny. Czekaj...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Wpisz wiadomość..."
        maxLength={5000}
        disabled={loading}
        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {text.length}/5000
        </span>
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Wysyłanie...' : 'Wyślij'}
        </button>
      </div>
    </form>
  );
}
