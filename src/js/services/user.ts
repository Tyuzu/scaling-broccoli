import { apiFetch } from '../api/api';

export function getUser(id: string) {
  return apiFetch<{ id: string; name: string }>(`/api/users/${id}`);
}