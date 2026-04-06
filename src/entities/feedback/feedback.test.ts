import type { Database } from '@/libs/supabase/types';

import { createFeedback } from './actions';
import { listUserFeedback } from './queries';
import { Feedback, FeedbackInput } from './types';

jest.mock('@/libs/supabase/supabase-server-client', () => ({
  createSupabaseServerClient: jest.fn(),
}));

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

const mockedCreateClient = createSupabaseServerClient as jest.MockedFunction<typeof createSupabaseServerClient>;

type MockClient = {
  auth: { getUser: jest.Mock };
  from: jest.Mock;
};

function buildClient(overrides: Partial<MockClient> = {}): MockClient {
  return {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
    ...overrides,
  };
}

describe('FeedbackInput schema', () => {
  const validInput = { subject: 'Great app', body: 'I love it' };

  it('accepts a valid input', () => {
    const result = FeedbackInput.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects an empty subject', () => {
    const result = FeedbackInput.safeParse({ ...validInput, subject: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a subject longer than 120 chars', () => {
    const result = FeedbackInput.safeParse({ ...validInput, subject: 'a'.repeat(121) });
    expect(result.success).toBe(false);
  });

  it('rejects an empty body', () => {
    const result = FeedbackInput.safeParse({ ...validInput, body: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a body longer than 2000 chars', () => {
    const result = FeedbackInput.safeParse({ ...validInput, body: 'a'.repeat(2001) });
    expect(result.success).toBe(false);
  });
});

describe('Feedback schema', () => {
  it('accepts a fully-populated row', () => {
    const row = {
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      subject: 'Hi',
      body: 'Hello there',
      created_at: '2026-04-06T12:00:00.000Z',
      updated_at: '2026-04-06T12:00:00.000Z',
      deleted_at: null,
    };
    const result = Feedback.safeParse(row);
    expect(result.success).toBe(true);
  });
});

describe('generated Supabase type alignment', () => {
  it('Feedback schema matches the generated feedback Row type', () => {
    // Compile-time: any divergence between the generated Row type and the
    // Zod-inferred Feedback type produces a TS error here.
    type Row = Database['public']['Tables']['feedback']['Row'];
    const row: Row = {
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      subject: 'Hi',
      body: 'Hello there',
      created_at: '2026-04-06T12:00:00.000Z',
      updated_at: '2026-04-06T12:00:00.000Z',
      deleted_at: null,
    };
    const parsed: Feedback = row;
    expect(parsed.id).toBe(row.id);
  });
});

describe('createFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validInput = { subject: 'Hi', body: 'Hello there' };

  it('inserts a row and returns it on success', async () => {
    const insertedRow = {
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      subject: 'Hi',
      body: 'Hello there',
      created_at: '2026-04-06T12:00:00.000Z',
      updated_at: '2026-04-06T12:00:00.000Z',
      deleted_at: null,
    };
    const single = jest.fn().mockResolvedValue({ data: insertedRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const from = jest.fn().mockReturnValue({ insert });
    const client = buildClient({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: '00000000-0000-0000-0000-000000000002' } },
          error: null,
        }),
      },
      from,
    });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await createFeedback(validInput);

    expect(result).toEqual({ data: insertedRow, error: null });
    expect(from).toHaveBeenCalledWith('feedback');
    expect(insert).toHaveBeenCalledWith({
      subject: 'Hi',
      body: 'Hello there',
      user_id: '00000000-0000-0000-0000-000000000002',
    });
  });

  it('returns UNAUTHENTICATED when there is no user', async () => {
    const client = buildClient({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await createFeedback(validInput);

    expect(result.data).toBeNull();
    expect(result.error).toEqual({
      error_code: 'UNAUTHENTICATED',
      message: 'Sign in to send feedback',
    });
    expect(client.from).not.toHaveBeenCalled();
  });

  it('returns VALIDATION_ERROR when input fails Zod', async () => {
    const client = buildClient({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: '00000000-0000-0000-0000-000000000002' } },
          error: null,
        }),
      },
    });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await createFeedback({ subject: '', body: '' } as never);

    expect(result.data).toBeNull();
    expect(result.error?.error_code).toBe('VALIDATION_ERROR');
    expect(client.from).not.toHaveBeenCalled();
  });

  it('returns INSERT_FAILED when the database insert errors', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const client = buildClient({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: '00000000-0000-0000-0000-000000000002' } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({ insert }),
    });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await createFeedback(validInput);

    expect(result.data).toBeNull();
    expect(result.error?.error_code).toBe('INSERT_FAILED');
  });
});

describe('listUserFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function buildSelectChain(rows: unknown) {
    const range = jest.fn().mockResolvedValue({ data: rows, error: null });
    const order = jest.fn().mockReturnValue({ range });
    const select = jest.fn().mockReturnValue({ order });
    const from = jest.fn().mockReturnValue({ select });
    return { from, select, order, range };
  }

  it('returns paginated rows with default page=1, pageSize=10 (range 0..9)', async () => {
    const rows = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        user_id: '00000000-0000-0000-0000-000000000002',
        subject: 'Hi',
        body: 'Hello there',
        created_at: '2026-04-06T12:00:00.000Z',
        updated_at: '2026-04-06T12:00:00.000Z',
        deleted_at: null,
      },
    ];
    const chain = buildSelectChain(rows);
    const client = buildClient({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: '00000000-0000-0000-0000-000000000002' } },
          error: null,
        }),
      },
      from: chain.from,
    });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await listUserFeedback({});

    expect(result).toEqual({ data: rows, error: null });
    expect(chain.from).toHaveBeenCalledWith('feedback');
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(chain.range).toHaveBeenCalledWith(0, 9);
  });

  it('computes the correct offset/limit for page=3, pageSize=5 (range 10..14)', async () => {
    const chain = buildSelectChain([]);
    const client = buildClient({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: '00000000-0000-0000-0000-000000000002' } },
          error: null,
        }),
      },
      from: chain.from,
    });
    mockedCreateClient.mockResolvedValue(client as never);

    await listUserFeedback({ page: 3, pageSize: 5 });

    expect(chain.range).toHaveBeenCalledWith(10, 14);
  });

  it('returns UNAUTHENTICATED when there is no user', async () => {
    const client = buildClient({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await listUserFeedback({});

    expect(result.data).toBeNull();
    expect(result.error?.error_code).toBe('UNAUTHENTICATED');
  });
});
