import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import NavBar from './NavBar';

jest.mock('@react-oauth/google', () => ({
  googleLogout: jest.fn(),
}));

describe('NavBar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders navigation', () => {
    render(
      <MemoryRouter>
        <SnackbarProvider>
          <NavBar />
        </SnackbarProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});