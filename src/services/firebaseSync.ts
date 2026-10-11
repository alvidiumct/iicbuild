import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  User,
  AmbassadorProfile,
  IICProject,
  AmbassadorAvailability,
  Task,
  Announcement,
  TimeEntry,
  IICLogoSettings,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_AMBASSADORS,
  INITIAL_PROJECTS,
  INITIAL_AVAILABILITY,
  INITIAL_TASKS,
  INITIAL_ANNOUNCEMENTS,
} from '../data/mockData';

export interface FirebaseSyncStatus {
  connected: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  rulesNeedUpdate: boolean;
}

// ---------------------------------------------------------------------------
// 1. Initial Cloud Seeding (Runs once if Firestore collections are empty)
// ---------------------------------------------------------------------------
export async function seedFirestoreIfEmpty(): Promise<{ seeded: boolean; error?: string }> {
  try {
    const usersCol = collection(db, 'users');
    const existingUsersSnap = await getDocs(usersCol);

    if (existingUsersSnap.empty) {
      console.log('[Firebase] Empty collections detected. Seeding initial DIU IIC tables...');
      const batch = writeBatch(db);

      // Seed Users
      INITIAL_USERS.forEach((u) => {
        const ref = doc(db, 'users', u.id);
        batch.set(ref, {
          ...u,
          // ensure admin has the updated credentials
          ...(u.role === 'ADMIN' ? { email: 'iicdaffodil@gmail.com', password: 'iic@2026' } : {}),
          syncedAt: new Date().toISOString(),
        });
      });

      // Seed Ambassadors
      INITIAL_AMBASSADORS.forEach((a) => {
        const ref = doc(db, 'ambassadors', a.id);
        batch.set(ref, {
          ...a,
          syncedAt: new Date().toISOString(),
        });
      });

      // Seed 5 Official Projects
      INITIAL_PROJECTS.forEach((p) => {
        const ref = doc(db, 'projects', p.id);
        batch.set(ref, {
          ...p,
          syncedAt: new Date().toISOString(),
        });
      });

      // Seed Availability
      INITIAL_AVAILABILITY.forEach((av) => {
        const ref = doc(db, 'availability', av.ambassadorId);
        batch.set(ref, {
          ...av,
          syncedAt: new Date().toISOString(),
        });
      });

      // Seed Tasks
      INITIAL_TASKS.forEach((t) => {
        const ref = doc(db, 'tasks', t.id);
        batch.set(ref, {
          ...t,
          syncedAt: new Date().toISOString(),
        });
      });

      // Seed Default Branding
      const brandingRef = doc(db, 'settings', 'branding');
      batch.set(brandingRef, {
        useIICLogo: true,
        logoUrl: '/src/assets/images/iic_official_logo_1791605685128.jpg',
        logoType: 'official',
        displayStyle: 'badge',
        updatedAt: new Date().toISOString(),
      });

      await batch.commit();
      console.log('[Firebase] Initial seeding completed successfully.');
      return { seeded: true };
    } else {
      // Check if admin user in Firestore has updated email
      const adminDoc = existingUsersSnap.docs.find((d) => d.id === 'user-admin-1');
      if (adminDoc && adminDoc.data().email !== 'iicdaffodil@gmail.com') {
        await updateDoc(doc(db, 'users', 'user-admin-1'), {
          email: 'iicdaffodil@gmail.com',
          password: 'iic@2026',
        });
      }
      return { seeded: false };
    }
  } catch (err: any) {
    console.warn('[Firebase Seed] Warning during Firestore seeding check:', err);
    return {
      seeded: false,
      error: err?.message || 'Could not verify or seed Firestore collections',
    };
  }
}

// ---------------------------------------------------------------------------
// 2. Real-time Cloud Subscriptions
// ---------------------------------------------------------------------------

export function subscribeToUsers(
  onData: (users: User[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      if (!snapshot.empty) {
        const users: User[] = [];
        snapshot.forEach((docSnap) => {
          users.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        onData(users);
      }
    },
    (err) => {
      console.warn('[Firebase] Users subscription warning:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToAmbassadors(
  onData: (ambassadors: AmbassadorProfile[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'ambassadors'),
    (snapshot) => {
      if (!snapshot.empty) {
        const list: AmbassadorProfile[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        onData(list);
      }
    },
    (err) => {
      console.warn('[Firebase] Ambassadors subscription warning:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToProjects(
  onData: (projects: IICProject[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'projects'),
    (snapshot) => {
      if (!snapshot.empty) {
        const list: IICProject[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        onData(list);
      }
    },
    (err) => {
      console.warn('[Firebase] Projects subscription warning:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToAvailability(
  onData: (availability: AmbassadorAvailability[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'availability'),
    (snapshot) => {
      if (!snapshot.empty) {
        const list: AmbassadorAvailability[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ambassadorId: docSnap.id, ...(docSnap.data() as any) });
        });
        onData(list);
      }
    },
    (err) => {
      console.warn('[Firebase] Availability subscription warning:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToTasks(
  onData: (tasks: Task[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'tasks'),
    (snapshot) => {
      if (!snapshot.empty) {
        const list: Task[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        onData(list);
      }
    },
    (err) => {
      console.warn('[Firebase] Tasks subscription warning:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToSettings(
  onData: (settings: IICLogoSettings) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, 'settings', 'branding'),
    (docSnap) => {
      if (docSnap.exists()) {
        onData(docSnap.data() as IICLogoSettings);
      }
    },
    (err) => {
      console.warn('[Firebase] Settings subscription warning:', err);
    }
  );
}

// ---------------------------------------------------------------------------
// 3. Write / Mutation Helpers
// ---------------------------------------------------------------------------

export async function syncUserToFirestore(user: User): Promise<void> {
  try {
    await setDoc(doc(db, 'users', user.id), {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Failed to write user to Firestore:', err);
  }
}

export async function syncAmbassadorToFirestore(amb: AmbassadorProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'ambassadors', amb.id), {
      ...amb,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Failed to write ambassador to Firestore:', err);
  }
}

export async function syncAvailabilityToFirestore(av: AmbassadorAvailability): Promise<void> {
  try {
    await setDoc(doc(db, 'availability', av.ambassadorId), {
      ...av,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Failed to write availability to Firestore:', err);
  }
}

export async function syncProjectToFirestore(project: IICProject): Promise<void> {
  try {
    await setDoc(doc(db, 'projects', project.id), {
      ...project,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Failed to write project to Firestore:', err);
  }
}

export async function syncTaskToFirestore(task: Task): Promise<void> {
  try {
    await setDoc(doc(db, 'tasks', task.id), {
      ...task,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Failed to write task to Firestore:', err);
  }
}

export async function syncSettingsToFirestore(settings: IICLogoSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'branding'), {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Failed to write branding settings to Firestore:', err);
  }
}

export async function syncAuditLogToFirestore(log: any): Promise<void> {
  try {
    await setDoc(doc(db, 'audit_logs', log.id), {
      ...log,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Failed to write audit log to Firestore:', err);
  }
}
