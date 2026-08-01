import React, { useState, useEffect } from 'react';
import { Conversation } from '../../types';
import { subscribeUserConversations } from '../../lib/ChatEngine';
import { useAuth } from '../../lib/AuthContext';
import { MessageSquare, Clock } from 'lucide-react';

interface ConversationListProps {
  onSelectConversation: (conv: Conversation) => void;
  selectedId?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation, selectedId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeUserConversations(user.uid, (list) => {
      setConversations(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="p-4 text-center text-xs text-slate-400">Ładowanie rozmów...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">Brak aktywnych wiadomości</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/60">
      {conversations.map(conv => {
        const otherParticipantId = conv.participants.find(p => p !== user?.uid) || '';
        const name = conv.participantNames[otherParticipantId] || 'Użytkownik';
        const unread = (conv.unreadCount && conv.unreadCount[user?.uid || '']) || 0;
        const isSelected = selectedId === conv.id;

        return (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv)}
            className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
              isSelected 
                ? 'bg-indigo-50/80 dark:bg-indigo-900/30' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{name}</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {conv.lastMessage || 'Brak wiadomości'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
              <span className="text-[10px] text-slate-400">
                {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full">
                  {unread}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
