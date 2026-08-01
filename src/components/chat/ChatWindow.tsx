import React, { useState, useEffect, useRef } from 'react';
import { Message, Conversation } from '../../types';
import { 
  subscribeConversationMessages, 
  sendChatMessage, 
  markConversationAsRead 
} from '../../lib/ChatEngine';
import { useAuth } from '../../lib/AuthContext';
import { Send, Image, X, CheckCheck, Loader2 } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation;
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onClose }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipantId = conversation.participants.find(p => p !== user?.uid) || '';
  const otherParticipantName = conversation.participantNames[otherParticipantId] || 'Użytkownik';

  useEffect(() => {
    if (!conversation.id || !user) return;

    // Subscribe to messages in realtime
    const unsubscribe = subscribeConversationMessages(conversation.id, (list) => {
      setMessages(list);
    });

    // Mark as read
    markConversationAsRead(conversation.id, user.uid);

    return () => unsubscribe();
  }, [conversation.id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !imageInput.trim()) || !user || sending) return;

    setSending(true);
    try {
      await sendChatMessage(
        conversation.id,
        user.uid,
        otherParticipantId,
        profile?.name || user.displayName || 'Użytkownik',
        text.trim(),
        imageInput.trim() || undefined
      );
      setText('');
      setImageInput('');
      setShowImageModal(false);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[550px] max-h-[85vh] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            {otherParticipantName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{otherParticipantName}</h3>
            <p className="text-[11px] text-emerald-500 font-medium">Aktywny teraz</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center">
            Brak wcześniejszych wiadomości.<br />Napisz pierwszą wiadomość!
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="Załącznik" 
                      className="rounded-lg mb-2 max-h-48 object-cover w-full cursor-pointer"
                      onClick={() => window.open(msg.imageUrl, '_blank')}
                    />
                  )}
                  {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image URL Modal */}
      {showImageModal && (
        <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <input
            type="url"
            placeholder="Wklej adres URL zdjęcia (https://...)"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
          <button 
            onClick={() => setShowImageModal(false)}
            className="px-2 py-1.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
          >
            Gotowe
          </button>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowImageModal(!showImageModal)}
          className={`p-2 rounded-xl transition-colors ${
            imageInput ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
          title="Dodaj URL zdjęcia"
        >
          <Image className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Wpisz wiadomość..."
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={sending || (!text.trim() && !imageInput.trim())}
          className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
