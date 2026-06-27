import type { PetProfile } from "../types/pet";

const profileKey = "deskpaw-current-profile";
const logKey = "deskpaw-companion-log";

export function saveProfile(profile: PetProfile) {
  localStorage.setItem(profileKey, JSON.stringify(profile));
}

export function loadProfile(): PetProfile | null {
  const raw = localStorage.getItem(profileKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PetProfile;
  } catch {
    return null;
  }
}

export function appendLog(message: string) {
  const logs = loadLogs();
  const nextLogs = [{ message, createdAt: new Date().toISOString() }, ...logs].slice(0, 8);
  localStorage.setItem(logKey, JSON.stringify(nextLogs));
  return nextLogs;
}

export function loadLogs(): Array<{ message: string; createdAt: string }> {
  const raw = localStorage.getItem(logKey);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as Array<{ message: string; createdAt: string }>;
  } catch {
    return [];
  }
}
