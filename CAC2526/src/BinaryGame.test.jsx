import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BinaryGame from './BinaryGame.jsx';

const challenge = {
  level: 1,
  factual: true,
  text: 'This verified claim is true.',
  videoURL: 'videos/binary.mp4'
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
    empty: false,
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

describe('BinaryGame wrong answer loading state', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    URL.createObjectURL = vi.fn(() => 'blob:binary-video');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows the loading placeholder again after a wrong answer', async () => {
    render(
      <BinaryGame
        user={{
          uid: 'user-1',
          displayName: 'Test User',
          email: 'test@example.com'
        }}
      />
    );

    await screen.findByText('This verified claim is true.');

    await waitFor(() => {
      expect(document.querySelectorAll('video')).toHaveLength(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'False' }));

    expect(screen.getByText('Loading video…')).toBeInTheDocument();
    expect(screen.getByText('Loading challenge…')).toBeInTheDocument();
    expect(screen.queryByText('This verified claim is true.')).not.toBeInTheDocument();
    expect(document.querySelectorAll('video')).toHaveLength(0);
  });
});
