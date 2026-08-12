import { vi } from 'vitest';

const client = {
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  request: vi.fn(),
};

const axios = {
  ...client,
  create: vi.fn(() => client),
  isAxiosError: vi.fn((error: unknown) => Boolean((error as any)?.isAxiosError)),
};

export default axios;
