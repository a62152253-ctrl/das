import { getFirebaseDb } from '@/lib/firebase';
import { collection, addDoc, query, where, limit, onSnapshot } from 'firebase/firestore';
import { UserHistoryItem } from '@/types';

export async function recordHistoryItem(
  userId: string,
  type: 'company_view' | 'search',
  title: string,
  subtitle?: string,
  targetId?: string
): Promise<void> {
  if (!userId || !title) return;
  try {
    const db = getFirebaseDb();
    await addDoc(collection(db, 'history'), {
      userId,
      type,
      title,
      subtitle: subtitle || '',
      targetId: targetId || '',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error recording user history:', err);
  }
}

export function subscribeUserHistory(
  userId: string,
  callback: (history: UserHistoryItem[]) => void
) {
  if (!userId) {
    callback([]);
    return () => {};
  }
  const db = getFirebaseDb();
  const q = query(
    collection(db, 'history'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list: UserHistoryItem[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as UserHistoryItem));
    
    // Sort descending by timestamp
    list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    // Keep top 20 most recent
    callback(list.slice(0, 20));
  }, (err) => {
    console.error('Error listening to history:', err);
    callback([]);
  });
}
