import { getFirebaseDb } from '@/lib/firebase';
import { getFirebaseModules } from '@/lib/LazyFirebase';
import { Conversation, Message } from '@/types';
import { createNotification } from '@/lib/NotificationEngine';

export function getConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

export async function getOrCreateConversation(
  userId1: string,
  userId2: string,
  name1: string,
  name2: string
): Promise<string> {
  const db = getFirebaseDb();
  const convId = getConversationId(userId1, userId2);
  const fb = await getFirebaseModules();
  const convRef = fb.doc(db, 'conversations', convId);

  const snap = await fb.getDoc(convRef);
  if (!snap.exists()) {
    const now = new Date().toISOString();
    await fb.setDoc(convRef, {
      id: convId,
      participants: [userId1, userId2],
      participantNames: {
        [userId1]: name1,
        [userId2]: name2
      },
      lastMessage: 'Rozpoczęto rozmowę',
      lastMessageTimestamp: now,
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0
      },
      updatedAt: now
    });
  }

  return convId;
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  senderName: string,
  content: string,
  imageUrl?: string
): Promise<string> {
  const db = getFirebaseDb();
  const now = new Date().toISOString();

  // Add message document to subcollection or root collection 'messages'
  const fb = await getFirebaseModules();
  const messageRef = await fb.addDoc(fb.collection(db, 'conversations', conversationId, 'messages'), {
    conversationId,
    senderId,
    receiverId,
    senderName,
    content,
    imageUrl: imageUrl || null,
    timestamp: now,
    read: false
  });

  // Update conversation last message & unread counter
  const convRef = fb.doc(db, 'conversations', conversationId);
  const convSnap = await fb.getDoc(convRef);
  let currentUnread = 0;

  if (convSnap.exists()) {
    const data = convSnap.data();
    currentUnread = (data.unreadCount && data.unreadCount[receiverId]) || 0;
  }

  await fb.updateDoc(convRef, {
    lastMessage: imageUrl ? '📷 [Zdjęcie]' : content,
    lastMessageTimestamp: now,
    updatedAt: now,
    [`unreadCount.${receiverId}`]: currentUnread + 1
  });

  // Trigger Notification to receiver
  await createNotification({
    userId: receiverId,
    title: `Wiadomość od ${senderName}`,
    content: imageUrl ? '📷 Przesłano zdjęcie' : (content.length > 40 ? content.slice(0, 40) + '...' : content),
    type: 'message',
    linkId: conversationId
  });

  return messageRef.id;
}

export function subscribeUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
) {
  const db = getFirebaseDb();
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list: Conversation[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Conversation));

    list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    callback(list);
  }, (err) => {
    console.error('Error in conversations subscription:', err);
    callback([]);
  });
}

export function subscribeConversationMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
) {
  const db = getFirebaseDb();
  const messagesCol = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const msgs: Message[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
    callback(msgs);
  }, (err) => {
    console.error('Error listening to messages:', err);
    callback([]);
  });
}

export async function markConversationAsRead(conversationId: string, userId: string): Promise<void> {
  const db = getFirebaseDb();
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, {
    [`unreadCount.${userId}`]: 0
  });
}
