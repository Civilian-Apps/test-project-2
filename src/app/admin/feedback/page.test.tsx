/**
 * @jest-environment jsdom
 */
import type { Feedback } from '@/entities/feedback/types';
import { render, screen } from '@testing-library/react';

// --- Mocks ---------------------------------------------------------------

jest.mock('next/navigation', () => ({
  forbidden: jest.fn(() => {
    throw new Error('FORBIDDEN');
  }),
  redirect: jest.fn(() => {
    throw new Error('REDIRECT');
  }),
}));

jest.mock('@/libs/supabase/supabase-server-client', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@/entities/feedback/admin-list-feedback', () => ({
  fetchAdminFeedback: jest.fn(),
}));

import { forbidden, redirect } from 'next/navigation';

import { fetchAdminFeedback } from '@/entities/feedback/admin-list-feedback';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

import AdminFeedbackPage from './page';

const mockedCreateClient = createSupabaseServerClient as jest.MockedFunction<typeof createSupabaseServerClient>;
const mockedFetchAdminFeedback = fetchAdminFeedback as jest.MockedFunction<typeof fetchAdminFeedback>;
const mockedForbidden = forbidden as jest.MockedFunction<typeof forbidden>;
const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;

function buildSupabaseClient(user: { id: string; email?: string; role?: string } | null, accessToken = 'jwt-token') {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user:
            user === null
              ? null
              : {
                  id: user.id,
                  email: user.email,
                  app_metadata: user.role ? { role: user.role } : {},
                },
        },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: user === null ? null : { access_token: accessToken, user: { id: user.id } },
        },
        error: null,
      }),
    },
  } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>;
}

const sampleRow = (overrides: Partial<Feedback> = {}): Feedback => ({
  id: '00000000-0000-0000-0000-0000000000aa',
  user_id: '00000000-0000-0000-0000-0000000000bb',
  subject: 'Love the app',
  body: 'This is a lovely app and I use it every day to track my stuff.',
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  deleted_at: null,
  ...overrides,
});

async function renderPage(searchParams: Record<string, string> = {}) {
  const ui = await AdminFeedbackPage({
    searchParams: Promise.resolve(searchParams),
  });
  return render(ui);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AdminFeedbackPage', () => {
  it('renders the table with feedback rows for an admin caller', async () => {
    mockedCreateClient.mockResolvedValue(
      buildSupabaseClient({ id: 'admin-1', email: 'admin@example.com', role: 'admin' })
    );
    mockedFetchAdminFeedback.mockResolvedValue({
      data: {
        data: [sampleRow({ id: 'a', subject: 'First feedback' }), sampleRow({ id: 'b', subject: 'Second feedback' })],
        page: 1,
        pageSize: 20,
        total: 2,
      },
      error: null,
    });

    await renderPage();

    expect(screen.getByRole('heading', { name: /feedback/i })).toBeInTheDocument();
    expect(screen.getByText('First feedback')).toBeInTheDocument();
    expect(screen.getByText('Second feedback')).toBeInTheDocument();
    // Edge function called with default page/pageSize and forwarded JWT
    expect(mockedFetchAdminFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 20, accessToken: 'jwt-token' })
    );
    expect(mockedForbidden).not.toHaveBeenCalled();
  });

  it('truncates body to 200 chars with ellipsis', async () => {
    mockedCreateClient.mockResolvedValue(buildSupabaseClient({ id: 'admin-1', role: 'admin' }));
    const longBody = 'x'.repeat(500);
    mockedFetchAdminFeedback.mockResolvedValue({
      data: {
        data: [sampleRow({ body: longBody })],
        page: 1,
        pageSize: 20,
        total: 1,
      },
      error: null,
    });

    await renderPage();

    const truncated = 'x'.repeat(200) + '…';
    expect(screen.getByText(truncated)).toBeInTheDocument();
  });

  it('renders an empty state when there is no feedback', async () => {
    mockedCreateClient.mockResolvedValue(buildSupabaseClient({ id: 'admin-1', role: 'admin' }));
    mockedFetchAdminFeedback.mockResolvedValue({
      data: { data: [], page: 1, pageSize: 20, total: 0 },
      error: null,
    });

    await renderPage();

    expect(screen.getByText(/no feedback/i)).toBeInTheDocument();
    expect(mockedForbidden).not.toHaveBeenCalled();
  });

  it('calls forbidden() for a non-admin caller and never queries the edge function', async () => {
    mockedCreateClient.mockResolvedValue(buildSupabaseClient({ id: 'user-1' /* no role */ }));

    await expect(renderPage()).rejects.toThrow('FORBIDDEN');

    expect(mockedForbidden).toHaveBeenCalledTimes(1);
    expect(mockedFetchAdminFeedback).not.toHaveBeenCalled();
  });

  it('redirects unauthenticated callers to the login page', async () => {
    mockedCreateClient.mockResolvedValue(buildSupabaseClient(null));

    await expect(renderPage()).rejects.toThrow('REDIRECT');

    expect(mockedRedirect).toHaveBeenCalledWith('/login');
    expect(mockedFetchAdminFeedback).not.toHaveBeenCalled();
  });

  it('reads the page query param and forwards it to the edge function', async () => {
    mockedCreateClient.mockResolvedValue(buildSupabaseClient({ id: 'admin-1', role: 'admin' }));
    mockedFetchAdminFeedback.mockResolvedValue({
      data: { data: [], page: 3, pageSize: 20, total: 50 },
      error: null,
    });

    await renderPage({ page: '3' });

    expect(mockedFetchAdminFeedback).toHaveBeenCalledWith(expect.objectContaining({ page: 3, pageSize: 20 }));
  });
});
