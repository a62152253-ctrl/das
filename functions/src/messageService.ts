// functions/src/messageService.ts
// Użyj tego w komponencie frontend do wysyłania wiadomości

import { db } from '@/lib/firebase'; // Your Firebase config
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

interface SendMessageParams {
  userId: string;
  text: string;
  conversationId?: string;
}

/**
 * Wyślij wiadomość do Firestore
 * Cloud Functions automatycznie sprawdzą spam
 */
export async function sendMessage({
  userId,
  text,
  conversationId,
}: SendMessageParams) {
  try {
    // Validacja po stronie klienta
    if (!text.trim()) {
      throw new Error('Wiadomość nie może być pusta');
    }

    if (text.length > 5000) {
      throw new Error('Wiadomość za długa (max 5000 znaków)');
    }

    const messageRef = await addDoc(collection(db, 'messages'), {
      userId,
      text: text.trim(),
      conversationId: conversationId || null,
      timestamp: serverTimestamp(),
      flagged: false,
      reason: null,
    });

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Pobierz spam score użytkownika
 */
export async function getUserSpamScore(userId: string) {
  try {
    const docRef = await getDocs(
      query(collection(db, 'spamScores'), where('__name__', '==', userId))
    );

    if (docRef.empty) {
      return { score: 0, banned: false };
    }

    const data = docRef.docs[0].data();
    return {
      score: data.score || 0,
      banned: data.banned || false,
    };
  } catch (error) {
    console.error('Error getting spam score:', error);
    return { score: 0, banned: false };
  }
}

/**
 * Sprawdź czy użytkownik jest aktualnie rate limitowany
 */
export async function checkRateLimit(userId: string) {
  try {
    const docRef = await getDocs(
      query(collection(db, 'rateLimits'), where('__name__', '==', userId))
    );

    if (docRef.empty) {
      return { isLimited: false, blockedUntil: null };
    }

    const data = docRef.docs[0].data();
    const now = Date.now();

    if (data.blockedUntil && data.blockedUntil > now) {
      return {
        isLimited: true,
        blockedUntil: new Date(data.blockedUntil),
      };
    }

    return { isLimited: false, blockedUntil: null };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return { isLimited: false, blockedUntil: null };
  }
}

/**
 * Pobierz flagowane wiadomości
 */
export async function getFlaggedMessages(userId: string) {
  try {
    const q = query(
      collection(db, 'messages'),
      where('userId', '==', userId),
      where('flagged', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching flagged messages:', error);
    return [];
  }
}
