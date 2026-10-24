import { apiFetch } from './api';
import type { Assessment } from '../types/assessment';

/** Fetch all assessments for the authenticated user */
export async function getAssessments(): Promise<Assessment[]> {
  return apiFetch<Assessment[]>('/api/assessments');
}

/** Fetch a single assessment by ID (must belong to the authenticated user) */
export async function getAssessmentById(id: number): Promise<Assessment> {
  return apiFetch<Assessment>(`/api/assessments/${id}`);
}
