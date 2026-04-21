import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TwoChoiceGame from './TwoChoiceGame.jsx';

const challenge = {
  level: 67,
  optionTrue: 'Verified claim',
  optionFalse: 'Extreme false claim',
  videoTrue: 'videos/verified.mp4',
  videoFalse: 'videos/false.mp4'
};

vi.mock('./NavBar.jsx', () => ({
  default: () => <nav data-testid="navbar" />
}));

vi.mock('./EyeLogo.jsx', () => ({
  default: () => <div data-testid="eye-logo" />
}));

vi.mock('./firebase.js', () => ({
  db: {},
  storage: {},
  collection: vi.fn(() => 'challenges-ref'),
  doc: vi.fn(() => 'doc-ref'),
  getBlob: vi.fn(async () => new Blob(['video'], { type: 'video/mp4' })),
  getDocs: vi.fn(async () => ({
    docs: [
      {
        id: 'challenge-1',
        data: () => challenge
      }
    ]
  })),
  increment: vi.fn((value) => value),
  orderBy: vi.fn(() => 'order-by-level'),
  query: vi.fn(() => 'challenge-query'),
  ref: vi.fn((_, path) => path),
  setDoc: vi.fn(async () => undefined),
  where: vi.fn(() => 'where-level')
}));

describe('TwoChoiceGame scrolling', () => {
  beforeEach(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'scroll';
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    URL.createObjectURL = vi.fn(() => 'blob:challenge-video');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });

  it('does not lock document scrolling while mounted', async () => {
    const { unmount } = render(
      <TwoChoiceGame
        user={{
          uid: 'user-1',
          displayName: 'Test User',
          email: 'test@example.com'
        }}
      />
    );

    expect(document.body.style.overflow).toBe('auto');
    expect(document.documentElement.style.overflow).toBe('scroll');

    expect(await screen.findByText('Verified claim')).toBeInTheDocument();
    expect(await screen.findByText('Extreme false claim')).toBeInTheDocument();

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
    });

    expect(document.body.style.overflow).toBe('auto');
    expect(document.documentElement.style.overflow).toBe('scroll');

    unmount();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.documentElement.style.overflow).toBe('scroll');
  });

  it('shows loading placeholders again after a wrong answer', async () => {
    render(
      <TwoChoiceGame
        user={{
          uid: 'user-1',
          displayName: 'Test User',
          email: 'test@example.com'
        }}
      />
    );

    await screen.findByText('Verified claim');

    await waitFor(() => {
      expect(document.querySelectorAll('video')).toHaveLength(2);
    });

    fireEvent.click(screen.getByRole('button', { name: 'This one!' }));

    expect(screen.getAllByText('Loading video…')).toHaveLength(2);
    expect(screen.getAllByText('Loading challenge…')).toHaveLength(2);
    expect(screen.queryByText('Verified claim')).not.toBeInTheDocument();
    expect(screen.queryByText('Extreme false claim')).not.toBeInTheDocument();
    expect(document.querySelectorAll('video')).toHaveLength(0);
  });
});
