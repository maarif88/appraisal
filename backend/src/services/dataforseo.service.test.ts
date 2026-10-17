import { afterEach, expect, it, vi } from 'vitest';

vi.mock('dotenv', () => ({ default: { config: () => ({}) } }));
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules(); });

it('ignores provider credentials left in the environment', async () => {
  vi.stubEnv('DATAFORSEO_LOGIN', 'stale-login');
  vi.stubEnv('DATAFORSEO_PASSWORD', 'stale-password');
  const { env, isDataForSEOConfigured } = await import('../config/env.js');
  expect(isDataForSEOConfigured()).toBe(false);
  expect(env).not.toHaveProperty('DATAFORSEO_LOGIN');
  expect(env).not.toHaveProperty('DATAFORSEO_PASSWORD');
});

it('returns local mock trends at zero cost without network access', async () => {
  const blockedFetch = vi.fn(() => { throw new Error('network forbidden'); });
  vi.stubGlobal('fetch', blockedFetch);
  const { fetchTrends } = await import('./dataforseo.service.js');
  const result = await fetchTrends('example keyword');
  expect(result.cost).toBe(0);
  expect(result.data.monthly_index_5y).toHaveLength(60);
  expect(blockedFetch).not.toHaveBeenCalled();
});
