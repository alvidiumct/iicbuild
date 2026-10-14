import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
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
  ManualTimeRequest,
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
// 1. Initial Cloud Seeding & Full Table Installation
// ---------------------------------------------------------------------------
export async function installAllFirebaseTables(options?: {
  users?: User[];
  ambassadors?: AmbassadorProfile[];
  projects?: IICProject[];
  availability?: AmbassadorAvailability[];
  tasks?: Task[];
  announcements?: Announcement[];
  settings?: IICLogoSettings;
}): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log('[Firebase] Installing and syncing all tables to iicambasa Firestore...');
    const batch = writeBatch(db);
    let count = 0;

    const usersToSync = options?.users || INITIAL_USERS;
    usersToSync.forEach((u) => {
      const ref = doc(db, 'users', u.id);
      batch.set(ref, sanitizeForFirestore({
        ...u,
        ...(u.role === 'ADMIN' ? { email: 'iicdaffodil@gmail.com', password: 'iic@2026' } : {}),
        updatedAt: new Date().toISOString(),
      }), { merge: true });
      count++;
    });

    const ambassadorsToSync = options?.ambassadors || INITIAL_AMBASSADORS;
    ambassadorsToSync.forEach((a) => {
      const ref = doc(db, 'ambassadors', a.id);
      batch.set(ref, sanitizeForFirestore({
        ...a,
        updatedAt: new Date().toISOString(),
      }), { merge: true });
      count++;
    });

    const projectsToSync = options?.projects || INITIAL_PROJECTS;
    projectsToSync.forEach((p) => {
      const ref = doc(db, 'projects', p.id);
      batch.set(ref, sanitizeForFirestore({
        ...p,
        updatedAt: new Date().toISOString(),
      }), { merge: true });
      count++;
    });

    const availToSync = options?.availability || INITIAL_AVAILABILITY;
    availToSync.forEach((av) => {
      const ref = doc(db, 'availability', av.ambassadorId);
      batch.set(ref, sanitizeForFirestore({
        ...av,
        updatedAt: new Date().toISOString(),
      }), { merge: true });
      count++;
    });

    const tasksToSync = options?.tasks || INITIAL_TASKS;
    tasksToSync.forEach((t) => {
      const ref = doc(db, 'tasks', t.id);
      batch.set(ref, sanitizeForFirestore({
        ...t,
        updatedAt: new Date().toISOString(),
      }), { merge: true });
      count++;
    });

    const announcementsToSync = options?.announcements || INITIAL_ANNOUNCEMENTS;
    announcementsToSync.forEach((an) => {
      const ref = doc(db, 'announcements', an.id);
      batch.set(ref, {
        ...an,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      count++;
    });

    const brandingRef = doc(db, 'settings', 'branding');
    batch.set(brandingRef, {
      useIICLogo: true,
      logoUrl: '/src/assets/images/iic_official_logo_1791605685128.jpg',
      logoType: 'official',
      displayStyle: 'badge',
      ...(options?.settings || {}),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    count++;

    await batch.commit();
    console.log(`[Firebase] Successfully synced ${count} records across all tables.`);
    return { success: true, count };
  } catch (err: any) {
    console.warn('[Firebase] Full installation error:', err);
    return {
      success: false,
      count: 0,
      error: err?.message || 'Failed to install tables to Firestore. Check permissions.',
    };
  }
}

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
        batch.set(ref, sanitizeForFirestore({
          ...u,
          // ensure admin has the updated credentials
          ...(u.role === 'ADMIN' ? { email: 'iicdaffodil@gmail.com', password: 'iic@2026' } : {}),
          syncedAt: new Date().toISOString(),
        }));
      });

      // Seed Ambassadors
      INITIAL_AMBASSADORS.forEach((a) => {
        const ref = doc(db, 'ambassadors', a.id);
        batch.set(ref, sanitizeForFirestore({
          ...a,
          syncedAt: new Date().toISOString(),
        }));
      });

      // Seed 5 Official Projects
      INITIAL_PROJECTS.forEach((p) => {
        const ref = doc(db, 'projects', p.id);
        batch.set(ref, sanitizeForFirestore({
          ...p,
          syncedAt: new Date().toISOString(),
        }));
      });

      // Seed Availability
      INITIAL_AVAILABILITY.forEach((av) => {
        const ref = doc(db, 'availability', av.ambassadorId);
        batch.set(ref, sanitizeForFirestore({
          ...av,
          syncedAt: new Date().toISOString(),
        }));
      });

      // Seed Tasks
      INITIAL_TASKS.forEach((t) => {
        const ref = doc(db, 'tasks', t.id);
        batch.set(ref, sanitizeForFirestore({
          ...t,
          syncedAt: new Date().toISOString(),
        }));
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
      const list: Task[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onData(list);
    },
    (err) => {
      console.warn('[Firebase] Tasks subscription warning:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToTimeEntries(
  onData: (entries: TimeEntry[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'time_entries'),
    (snapshot) => {
      const list: TimeEntry[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onData(list);
    },
    (err) => {
      console.warn('[Firebase] Time entries subscription warning:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToManualTimeRequests(
  onData: (requests: ManualTimeRequest[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'manual_time_requests'),
    (snapshot) => {
      const list: ManualTimeRequest[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onData(list);
    },
    (err) => {
      console.warn('[Firebase] Manual time requests subscription warning:', err);
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

export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) {
      continue; // Strip undefined values completely so Firestore write never throws
    }
    if (val !== null && typeof val === 'object') {
      clean[key] = sanitizeForFirestore(val);
    } else if (typeof val === 'string' && val.length > 200000) {
      if (key === 'avatarUrl') {
        clean[key] = '/src/assets/images/avatar_ambassador_lead_1790178208374.jpg';
      } else {
        clean[key] = val.slice(0, 200000);
      }
    } else {
      clean[key] = val;
    }
  }
  return clean as T;
}

export async function syncUserToFirestore(user: User): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitized = sanitizeForFirestore(user);
    await setDoc(
      doc(db, 'users', sanitized.id),
      {
        ...sanitized,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`[Firebase] Synced user ${user.name} (${user.id}) to Firestore`);
    return { success: true };
  } catch (err: any) {
    console.error('[Firebase] Failed to write user to Firestore:', err);
    return { success: false, error: err?.message || 'Failed to sync user' };
  }
}

export async function syncAmbassadorToFirestore(amb: AmbassadorProfile): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitized = sanitizeForFirestore(amb);
    await setDoc(
      doc(db, 'ambassadors', sanitized.id),
      {
        ...sanitized,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log(`[Firebase] Synced ambassador ${amb.fullName} (${amb.id}) to Firestore`);
    return { success: true };
  } catch (err: any) {
    console.error('[Firebase] Failed to write ambassador to Firestore:', err);
    return { success: false, error: err?.message || 'Failed to sync ambassador' };
  }
}

export async function syncAmbassadorRegistration(
  user: User,
  ambassador: AmbassadorProfile
): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitizedUser = sanitizeForFirestore(user);
    const sanitizedAmb = sanitizeForFirestore(ambassador);
    const batch = writeBatch(db);

    batch.set(
      doc(db, 'users', sanitizedUser.id),
      {
        ...sanitizedUser,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    batch.set(
      doc(db, 'ambassadors', sanitizedAmb.id),
      {
        ...sanitizedAmb,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await batch.commit();
    console.log(`[Firebase] Successfully synced registration in batch: ${user.name} (${user.id})`);
    return { success: true };
  } catch (err: any) {
    console.error('[Firebase] Failed to write ambassador registration in batch:', err);
    return { success: false, error: err?.message || 'Cloud registration sync failed' };
  }
}

export async function batchSyncAmbassadors(
  records: Array<{ user: User; ambassador: AmbassadorProfile }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = writeBatch(db);
    records.forEach(({ user, ambassador }) => {
      const sanitizedUser = sanitizeForFirestore(user);
      const sanitizedAmb = sanitizeForFirestore(ambassador);
      batch.set(
        doc(db, 'users', sanitizedUser.id),
        { ...sanitizedUser, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      batch.set(
        doc(db, 'ambassadors', sanitizedAmb.id),
        { ...sanitizedAmb, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    });
    await batch.commit();
    return { success: true };
  } catch (err: any) {
    console.error('[Firebase] Failed batchSyncAmbassadors:', err);
    return { success: false, error: err?.message || 'Batch sync failed' };
  }
}

export async function deleteUserFromFirestore(userId: string, ambassadorId?: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
    if (ambassadorId) {
      await deleteDoc(doc(db, 'ambassadors', ambassadorId));
    }
  } catch (err) {
    console.warn('[Firebase] Failed to delete user from Firestore:', err);
  }
}

export async function fetchAllCloudData(): Promise<{
  users: User[];
  ambassadors: AmbassadorProfile[];
  projects: IICProject[];
  tasks: Task[];
  availability: AmbassadorAvailability[];
  timeEntries: TimeEntry[];
  manualTimeRequests: ManualTimeRequest[];
  settings?: IICLogoSettings;
}> {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const ambsSnap = await getDocs(collection(db, 'ambassadors'));
    const projSnap = await getDocs(collection(db, 'projects'));
    const taskSnap = await getDocs(collection(db, 'tasks'));
    const availSnap = await getDocs(collection(db, 'availability'));
    const timeSnap = await getDocs(collection(db, 'time_entries'));
    const manualSnap = await getDocs(collection(db, 'manual_time_requests'));

    const users: User[] = [];
    usersSnap.forEach((d) => users.push({ id: d.id, ...(d.data() as any) }));

    const ambassadors: AmbassadorProfile[] = [];
    ambsSnap.forEach((d) => ambassadors.push({ id: d.id, ...(d.data() as any) }));

    const projects: IICProject[] = [];
    projSnap.forEach((d) => projects.push({ id: d.id, ...(d.data() as any) }));

    const tasks: Task[] = [];
    taskSnap.forEach((d) => tasks.push({ id: d.id, ...(d.data() as any) }));

    const availability: AmbassadorAvailability[] = [];
    availSnap.forEach((d) => availability.push({ ambassadorId: d.id, ...(d.data() as any) }));

    const timeEntries: TimeEntry[] = [];
    timeSnap.forEach((d) => timeEntries.push({ id: d.id, ...(d.data() as any) }));

    const manualTimeRequests: ManualTimeRequest[] = [];
    manualSnap.forEach((d) => manualTimeRequests.push({ id: d.id, ...(d.data() as any) }));

    return { users, ambassadors, projects, tasks, availability, timeEntries, manualTimeRequests };
  } catch (err) {
    console.warn('[Firebase] fetchAllCloudData warning:', err);
    return { users: [], ambassadors: [], projects: [], tasks: [], availability: [], timeEntries: [], manualTimeRequests: [] };
  }
}

export async function syncAvailabilityToFirestore(av: AmbassadorAvailability): Promise<void> {
  try {
    const sanitized = sanitizeForFirestore(av);
    await setDoc(doc(db, 'availability', sanitized.ambassadorId), {
      ...sanitized,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Failed to write availability to Firestore:', err);
  }
}

export async function syncProjectToFirestore(project: IICProject): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitized = sanitizeForFirestore(project);
    await setDoc(doc(db, 'projects', sanitized.id), {
      ...sanitized,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error('[Firebase] Failed to write project to Firestore:', err);
    return { success: false, error: err?.message };
  }
}

export async function syncTaskToFirestore(task: Task): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitized = sanitizeForFirestore(task);
    await setDoc(doc(db, 'tasks', sanitized.id), {
      ...sanitized,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error('[Firebase] Failed to write task to Firestore:', err);
    return { success: false, error: err?.message };
  }
}

export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (err) {
    console.warn('[Firebase] Failed to delete task from Firestore:', err);
  }
}

export async function syncTimeEntryToFirestore(entry: TimeEntry): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitized = sanitizeForFirestore(entry);
    await setDoc(doc(db, 'time_entries', sanitized.id), {
      ...sanitized,
      syncedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.warn('[Firebase] Failed to write time entry to Firestore:', err);
    return { success: false, error: err?.message };
  }
}

export async function syncManualTimeRequestToFirestore(request: ManualTimeRequest): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitized = sanitizeForFirestore(request);
    await setDoc(doc(db, 'manual_time_requests', sanitized.id), {
      ...sanitized,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.warn('[Firebase] Failed to write manual time request to Firestore:', err);
    return { success: false, error: err?.message };
  }
}

export async function syncSettingsToFirestore(settings: IICLogoSettings): Promise<void> {
  try {
    const sanitized = sanitizeForFirestore(settings);
    await setDoc(doc(db, 'settings', 'branding'), {
      ...sanitized,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Failed to write branding settings to Firestore:', err);
  }
}

export async function syncAuditLogToFirestore(log: any): Promise<void> {
  try {
    const sanitized = sanitizeForFirestore(log);
    await setDoc(doc(db, 'audit_logs', sanitized.id), {
      ...sanitized,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('[Firebase] Failed to write audit log to Firestore:', err);
  }
}
