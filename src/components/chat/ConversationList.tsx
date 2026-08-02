import React, { useState, useEffect } from 'react';
import { Conversation } from '@/types';
import { subscribeUserConversations } from '../../lib/ChatEngine';
import { useAuth } from '../../lib/AuthContext';
import { MessageSquare, Clock, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/structure/Badge';

interface ConversationListProps {
  onSelectConversation: (conv: Conversation) => void;
  selectedId?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation, selectedId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeUserConversations(user.uid, (list) => {
      setConversations(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const filteredConversations = conversations.filter(conv => {
    const otherParticipantId = conv.participants.find(p => p !== user?.uid);
    const name = conv.participantNames[otherParticipantId || ''] || 'Użytkownik';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-600 dark:text-slate-400">Ładowanie rozmów...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Szukaj rozmów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
        {conversations.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Brak rozmów</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Wiadomości pojawią się tutaj</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">Nie znaleziono rozmów</p>
          </div>
        ) : (
          filteredConversations.map((conv, idx) => {
            const otherParticipantId = conv.participants.find(p => p !== user?.uid) || '';
            const name = conv.participantNames[otherParticipantId] || 'Użytkownik';
            const unread = (conv.unreadCount && conv.unreadCount[user?.uid || '']) || 0;
            const isSelected = selectedId === conv.id;

            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => onSelectConversation(conv)}
                className={cn(
                  'p-3 flex items-center justify-between cursor-pointer transition-all',
                  isSelected 
                    ? 'bg-indigo-50/80 dark:bg-indigo-900/30 border-l-4 border-indigo-600' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Avatar */}
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all',
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                  )}>
                    {name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={cn(
                        'text-xs font-bold truncate transition-colors',
                        isSelected
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-900 dark:text-white'
                      )}>
                        {name}
                      </h4>
                      {unread > 0 && (
                        <Badge variant="danger" size="sm" dotted>{unread}</Badge>
                      )}
                    </div>
                    <p className={cn(
                      'text-xs truncate',
                      isSelected
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-500 dark:text-slate-400'
                    )}>
                      {conv.lastMessage || 'Brak wiadomości'}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <span className="text-[10px] text-slate-400 ml-2 shrink-0">
                  {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Utility function
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
