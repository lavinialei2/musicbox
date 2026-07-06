import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('tone', () => ({
  getContext: () => ({ state: 'running' }),
  start: jest.fn(),
  Synth: jest.fn(),
  PolySynth: jest.fn().mockImplementation(() => ({
    volume: { value: 0 },
    toDestination() {
      return this;
    },
    triggerAttackRelease: jest.fn(),
    dispose: jest.fn(),
  })),
}));

test('renders the music box app', () => {
  render(<App />);
  const linkElement = screen.getByText(/Mobius Music Box/i);
  expect(linkElement).toBeInTheDocument();
});
