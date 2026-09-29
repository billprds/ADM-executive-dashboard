/* ============================================================
   Data-access layer.

   Today: returns fixture data from src/mock/mockData.ts.
   Later: point at Go backend by setting VITE_USE_MOCK_DATA=false
          and VITE_API_URL=http://localhost:8080 (or whatever).

   The frontend only knows about `fetchSnapshot()`. Neither the
   mock path nor the real path is visible to consuming components.
============================================================ */

import type { DashboardSnapshot } from './types';
import { mockSnapshot } from '../mock/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const API_URL = import.meta.env.VITE_API_URL ?? '';

/** Simulated network latency for the mock path — makes loading states testable. */
const MOCK_LATENCY_MS = 200;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchSnapshotReal(): Promise<DashboardSnapshot> {
  const res = await fetch(`${API_URL}/api/snapshot`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`API /snapshot returned ${res.status}`);
  }
  return (await res.json()) as DashboardSnapshot;
}

async function fetchSnapshotMock(): Promise<DashboardSnapshot> {
  await sleep(MOCK_LATENCY_MS);
  // Fresh timestamp each call so "refreshed at" updates naturally
  return { ...mockSnapshot, fetchedAt: new Date().toISOString() };
}

/** Public entry point used by App.tsx. */
export function fetchSnapshot(): Promise<DashboardSnapshot> {
  return USE_MOCK ? fetchSnapshotMock() : fetchSnapshotReal();
}

/** Whether the app is currently reading from mock data — surfaced in the UI. */
export const IS_MOCK = USE_MOCK;
