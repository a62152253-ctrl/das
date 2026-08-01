import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Rate limiting config: 5 messages per 4 seconds
const RATE_LIMIT_MESSAGES = 5;
const RATE_LIMIT_WINDOW_MS = 4000; // 4 seconds

/**
 * Triggered when a new message is created
 * Checks spam patterns and enforces rate limiting
 */
export const moderateMessage = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap) => {
    const msg = snap.data();
    const userId = msg.userId;
    const messageId = snap.ref.id;

    try {
      // Get user's spam score
      const spamScoreRef = await db.collection('spamScores').doc(userId).get();
      const spamScore = spamScoreRef.data()?.score ?? 0;

      // If banned, delete message immediately
      if (spamScoreRef.data()?.banned) {
        await snap.ref.update({
          flagged: true,
          reason: 'user_banned',
          deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return;
      }

      // Check rate limit
      const rateLimitRef = db.collection('rateLimits').doc(userId);
      const rateLimitDoc = await rateLimitRef.get();
      
      if (rateLimitDoc.exists) {
        const data = rateLimitDoc.data();
        const now = Date.now();
        
        // If currently blocked, delete message
        if (data.blockedUntil && data.blockedUntil > now) {
          await snap.ref.update({
            flagged: true,
            reason: 'rate_limited',
            deletedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          return;
        }
      }

      let flagReason: string | null = null;
      let spamIncrement = 0;

      // Pattern 1: Flood detection - same user posting too many messages
      const recentMessages = await db.collection('messages')
        .where('userId', '==', userId)
        .where('timestamp', '>', new Date(Date.now() - RATE_LIMIT_WINDOW_MS))
        .get();

      if (recentMessages.size >= RATE_LIMIT_MESSAGES) {
        flagReason = 'spam_flood';
        spamIncrement = 3;

        // Block user for 30 seconds
        await rateLimitRef.set({
          userId,
          blockedUntil: Date.now() + 30000,
          reason: 'flood_detected',
          messageCount: recentMessages.size,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Pattern 2: Suspicious URLs
      if (!flagReason && /https?:\/\//.test(msg.text)) {
        const isWhitelisted = isWhitelistedDomain(msg.text);
        if (!isWhitelisted) {
          flagReason = 'suspicious_link';
          spamIncrement = 2;
        }
      }

      // Pattern 3: Duplicate message within 1 minute
      if (!flagReason) {
        const duplicates = await db.collection('messages')
          .where('userId', '==', userId)
          .where('text', '==', msg.text)
          .where('timestamp', '>', new Date(Date.now() - 60000))
          .get();

        if (duplicates.size > 1) {
          flagReason = 'duplicate_message';
          spamIncrement = 1;
        }
      }

      // Pattern 4: Excessive caps (>60% uppercase)
      if (!flagReason && msg.text.length > 10) {
        const capsCount = (msg.text.match(/[A-Z]/g) || []).length;
        const capsRatio = capsCount / msg.text.length;
        if (capsRatio > 0.6) {
          flagReason = 'excessive_caps';
          spamIncrement = 1;
        }
      }

      // Pattern 5: Excessive special characters/emoji
      if (!flagReason && msg.text.length > 5) {
        const specialCount = (msg.text.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
        const specialRatio = specialCount / msg.text.length;
        if (specialRatio > 0.5) {
          flagReason = 'spam_characters';
          spamIncrement = 1;
        }
      }

      // Update message with flag status
      if (flagReason) {
        await snap.ref.update({
          flagged: true,
          reason: flagReason,
          flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Increment spam score
        if (spamIncrement > 0) {
          await incrementSpamScore(userId, spamIncrement);
        }

        functions.logger.warn(`Message ${messageId} flagged for user ${userId}:`, flagReason);
      } else {
        // Message is clean
        await snap.ref.update({
          flagged: false,
        });
        functions.logger.info(`Message ${messageId} passed spam checks`);
      }
    } catch (error) {
      functions.logger.error(`Error moderating message ${messageId}:`, error);
    }
  });

/**
 * Increment user's spam score and auto-ban if threshold reached
 */
async function incrementSpamScore(userId: string, amount: number) {
  const spamScoreRef = db.collection('spamScores').doc(userId);
  
  await spamScoreRef.set(
    {
      score: admin.firestore.FieldValue.increment(amount),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const updated = await spamScoreRef.get();
  const newScore = updated.data()?.score ?? 0;

  // Auto-ban if score exceeds 10
  if (newScore >= 10) {
    await spamScoreRef.update({
      banned: true,
      bannedAt: admin.firestore.FieldValue.serverTimestamp(),
      banReason: 'spam_score_exceeded',
    });

    // Also ban in users collection
    await db.collection('users').doc(userId).update({
      banned: true,
      banReason: 'spam_violations',
      bannedAt: admin.firestore.FieldValue.serverTimestamp(),
    }).catch(() => {
      // User doc might not exist, that's ok
    });

    functions.logger.warn(`User ${userId} auto-banned due to spam score ${newScore}`);
  }
}

/**
 * Check if domain is whitelisted for URL sharing
 */
function isWhitelistedDomain(text: string): boolean {
  const whitelist = [
    'yoursite.com',
    'lokalnie.pl',
    'github.com',
    'google.com',
    'youtube.com',
    'facebook.com',
  ];

  return whitelist.some((domain) => text.includes(domain));
}

/**
 * Scheduled function: Clean up flagged messages older than 7 days
 * Runs every day at 2 AM
 */
export const autoCleanupOldSpam = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Europe/Warsaw')
  .onRun(async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
      const snapshot = await db.collection('messages')
        .where('flagged', '==', true)
        .where('timestamp', '<', sevenDaysAgo)
        .limit(500)
        .get();

      let deleted = 0;
      for (const doc of snapshot.docs) {
        await doc.ref.delete();
        deleted++;
      }

      functions.logger.info(`Auto-cleanup: Deleted ${deleted} old flagged messages`);
    } catch (error) {
      functions.logger.error('Error in autoCleanupOldSpam:', error);
    }
  });

/**
 * Scheduled function: Reset rate limits (every 5 minutes)
 * Checks if blocks have expired and removes them
 */
export const resetExpiredRateLimits = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    try {
      const now = Date.now();
      const snapshot = await db.collection('rateLimits')
        .where('blockedUntil', '<', now)
        .limit(500)
        .get();

      let reset = 0;
      for (const doc of snapshot.docs) {
        await doc.ref.delete();
        reset++;
      }

      functions.logger.info(`Reset expired rate limits: ${reset} users`);
    } catch (error) {
      functions.logger.error('Error in resetExpiredRateLimits:', error);
    }
  });
