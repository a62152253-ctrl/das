// MySQL API Client Layer replacing direct Firebase Firestore calls
const API_BASE = '/api/mysql';

export async function fetchMysqlCollection(collectionName: string) {
  try {
    const res = await fetch(`${API_BASE}/${collectionName}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error(`Error fetching MySQL collection ${collectionName}:`, err);
  }
  return [];
}

export async function mutateMysqlRecord(collectionName: string, action: 'insert' | 'update' | 'delete', payload: any) {
  try {
    const res = await fetch(`${API_BASE}/${collectionName}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error(`Error mutating MySQL record in ${collectionName}:`, err);
    return false;
  }
}
