import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

describe('Frontend App', () => {
  it('renders application title', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }));

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Ivy Interactive Monorepo/i)).toBeDefined();
    });
  });
});
