let cached: any = null;

export async function getFirebaseModules() {
  if (!cached) {
    cached = await import('firebase/firestore');
  }
  return cached;
}
