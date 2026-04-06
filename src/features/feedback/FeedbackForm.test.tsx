import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  __esModule: true,
  MessageSquare: () => null,
}));

import { FeedbackForm } from './FeedbackForm';

const toastMock = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
  toast: (args: unknown) => toastMock(args),
  useToast: () => ({ toast: toastMock }),
}));

jest.mock('@/libs/supabase/supabase-browser-client', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getSession: async () => ({
        data: { session: { access_token: 'test-jwt-token' } },
        error: null,
      }),
    },
  }),
}));

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  toastMock.mockReset();
  process.env = { ...ORIGINAL_ENV, NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co' };
  global.fetch = jest.fn();
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

function openDialog() {
  fireEvent.click(screen.getByRole('button', { name: /send feedback/i }));
}

describe('FeedbackForm', () => {
  it('opens the dialog when the trigger is clicked', async () => {
    render(<FeedbackForm />);
    openDialog();
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/body/i)).toBeInTheDocument();
  });

  it('shows validation errors when the form is submitted empty', async () => {
    render(<FeedbackForm />);
    openDialog();
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /send/i }));
    await waitFor(() => {
      expect(within(dialog).getAllByRole('alert').length).toBeGreaterThanOrEqual(2);
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits successfully and shows a success toast', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'feedback-1', created_at: '2026-04-06T00:00:00Z' }),
    });

    render(<FeedbackForm />);
    openDialog();
    const dialog = await screen.findByRole('dialog');

    fireEvent.change(within(dialog).getByLabelText(/subject/i), { target: { value: 'Hello' } });
    fireEvent.change(within(dialog).getByLabelText(/body/i), { target: { value: 'This is feedback.' } });

    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: /send/i }));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://example.supabase.co/functions/v1/create-feedback');
    expect((init as RequestInit).method).toBe('POST');
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer test-jwt-token');
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      subject: 'Hello',
      body: 'This is feedback.',
    });

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/feedback received/i) })
      );
    });
  });

  it('shows an error toast on a 400 server error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { error_code: 'VALIDATION', message: 'bad input' } }),
    });

    render(<FeedbackForm />);
    openDialog();
    const dialog = await screen.findByRole('dialog');

    fireEvent.change(within(dialog).getByLabelText(/subject/i), { target: { value: 'Hello' } });
    fireEvent.change(within(dialog).getByLabelText(/body/i), { target: { value: 'This is feedback.' } });

    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: /send/i }));
    });

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ description: expect.stringContaining('VALIDATION') })
      );
    });
  });
});
