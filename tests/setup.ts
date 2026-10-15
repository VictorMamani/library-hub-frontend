import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { setSession } from '../src/services/api';

beforeEach(() => {
  // A missing mock fails the test instead of contacting the real API.
  jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Solicitud sin simular.'));
});

afterEach(() => {
  cleanup();
  setSession(null);
  jest.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
