import { useAuthStore } from '../store/authStore';

export type AppRole = 'admin' | 'instructor' | 'student';

export const hasRole = (role: string | undefined | null, allowed: AppRole[]) =>
  !!role && allowed.includes(role as AppRole);

export function useHasRole(allowed: AppRole[]) {
  const user = useAuthStore((s) => s.user);
  return hasRole(user?.role, allowed);
}


