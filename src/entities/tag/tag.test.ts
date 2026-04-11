import type { Database } from '@/libs/supabase/types';

import { createTag, softDeleteTag } from './actions';
import { listUserTags } from './queries';
import { Tag, TagInput } from './types';

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

const USER_ID = '00000000-0000-0000-0000-000000000002';
const TAG_ID = '00000000-0000-0000-0000-000000000001';

function authedUser() {
  return {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: USER_ID } },
      error: null,
    }),
  };
}

function noUser() {
  return {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
  };
}

describe('TagInput schema', () => {
  const validInput = { name: 'Important', color: '#aabbcc' };

  it('accepts a valid input', () => {
    const result = TagInput.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = TagInput.safeParse({ ...validInput, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a name longer than 40 chars', () => {
    const result = TagInput.safeParse({ ...validInput, name: 'a'.repeat(41) });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid hex colour (missing hash)', () => {
    const result = TagInput.safeParse({ ...validInput, color: 'aabbcc' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid hex colour (short form)', () => {
    const result = TagInput.safeParse({ ...validInput, color: '#abc' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid hex colour (non-hex characters)', () => {
    const result = TagInput.safeParse({ ...validInput, color: '#zzzzzz' });
    expect(result.success).toBe(false);
  });

  it('accepts uppercase hex', () => {
    const result = TagInput.safeParse({ ...validInput, color: '#AABBCC' });
    expect(result.success).toBe(true);
  });
});

describe('Tag schema', () => {
  it('accepts a fully-populated row', () => {
    const row = {
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      name: 'Important',
      color: '#aabbcc',
      created_at: '2026-04-06T12:00:00.000Z',
      updated_at: '2026-04-06T12:00:00.000Z',
      deleted_at: null,
    };
    const result = Tag.safeParse(row);
    expect(result.success).toBe(true);
  });

  it('rejects a row missing updated_at', () => {
    const row = {
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      name: 'Important',
      color: '#aabbcc',
      created_at: '2026-04-06T12:00:00.000Z',
      deleted_at: null,
    };
    const result = Tag.safeParse(row);
    expect(result.success).toBe(false);
  });
});

describe('generated Supabase type alignment', () => {
  it('Tag schema matches the generated tag Row type', () => {
    // Compile-time: any divergence between the generated Row type and the
    // Zod-inferred Tag type produces a TS error here.
    type Row = Database['public']['Tables']['tag']['Row'];
    const row: Row = {
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      name: 'Important',
      color: '#aabbcc',
      created_at: '2026-04-06T12:00:00.000Z',
      updated_at: '2026-04-06T12:00:00.000Z',
      deleted_at: null,
    };
    const parsed: Tag = row;
    expect(parsed.id).toBe(row.id);
  });
});

describe('createTag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validInput = { name: 'Important', color: '#aabbcc' };

  it('inserts a row and returns it on success', async () => {
    const insertedRow = {
      id: TAG_ID,
      user_id: USER_ID,
      name: 'Important',
      color: '#aabbcc',
      created_at: '2026-04-06T12:00:00.000Z',
      updated_at: '2026-04-06T12:00:00.000Z',
      deleted_at: null,
    };
    const single = jest.fn().mockResolvedValue({ data: insertedRow, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const from = jest.fn().mockReturnValue({ insert });
    const client = buildClient({ auth: authedUser(), from });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await createTag(validInput);

    expect(result).toEqual({ data: insertedRow, error: null });
    expect(from).toHaveBeenCalledWith('tag');
    expect(insert).toHaveBeenCalledWith({
      name: 'Important',
      color: '#aabbcc',
      user_id: USER_ID,
    });
  });

  it('returns UNAUTHENTICATED when there is no user', async () => {
    const client = buildClient({ auth: noUser() });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await createTag(validInput);

    expect(result.data).toBeNull();
    expect(result.error).toEqual({
      error_code: 'UNAUTHENTICATED',
      message: 'Sign in to create tags',
    });
    expect(client.from).not.toHaveBeenCalled();
  });

  it('returns VALIDATION_ERROR when input fails Zod (empty name)', async () => {
    const client = buildClient({ auth: authedUser() });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await createTag({ name: '', color: '#aabbcc' } as never);

    expect(result.data).toBeNull();
    expect(result.error?.error_code).toBe('VALIDATION_ERROR');
    expect(client.from).not.toHaveBeenCalled();
  });

  it('returns VALIDATION_ERROR when color is not a hex string', async () => {
    const client = buildClient({ auth: authedUser() });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await createTag({ name: 'Important', color: 'red' } as never);

    expect(result.data).toBeNull();
    expect(result.error?.error_code).toBe('VALIDATION_ERROR');
    expect(client.from).not.toHaveBeenCalled();
  });

  it('returns INSERT_FAILED when the database insert errors', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const client = buildClient({
      auth: authedUser(),
      from: jest.fn().mockReturnValue({ insert }),
    });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await createTag(validInput);

    expect(result.data).toBeNull();
    expect(result.error?.error_code).toBe('INSERT_FAILED');
  });
});

describe('softDeleteTag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function buildUpdateChain(result: { data: unknown; error: unknown }) {
    const single = jest.fn().mockResolvedValue(result);
    const select = jest.fn().mockReturnValue({ single });
    const eqUser = jest.fn().mockReturnValue({ select });
    const eqId = jest.fn().mockReturnValue({ eq: eqUser });
    const update = jest.fn().mockReturnValue({ eq: eqId });
    const from = jest.fn().mockReturnValue({ update });
    return { from, update, eqId, eqUser, select, single };
  }

  it('marks the row as deleted and returns it on success', async () => {
    const updatedRow = {
      id: TAG_ID,
      user_id: USER_ID,
      name: 'Important',
      color: '#aabbcc',
      created_at: '2026-04-06T12:00:00.000Z',
      updated_at: '2026-04-06T13:00:00.000Z',
      deleted_at: '2026-04-06T13:00:00.000Z',
    };
    const chain = buildUpdateChain({ data: updatedRow, error: null });
    const client = buildClient({ auth: authedUser(), from: chain.from });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await softDeleteTag(TAG_ID);

    expect(result).toEqual({ data: updatedRow, error: null });
    expect(chain.from).toHaveBeenCalledWith('tag');
    expect(chain.update).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
    expect(chain.eqId).toHaveBeenCalledWith('id', TAG_ID);
    expect(chain.eqUser).toHaveBeenCalledWith('user_id', USER_ID);
  });

  it('returns UNAUTHENTICATED when there is no user', async () => {
    const client = buildClient({ auth: noUser() });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await softDeleteTag(TAG_ID);

    expect(result.data).toBeNull();
    expect(result.error?.error_code).toBe('UNAUTHENTICATED');
    expect(client.from).not.toHaveBeenCalled();
  });

  it('returns VALIDATION_ERROR when id is not a uuid', async () => {
    const client = buildClient({ auth: authedUser() });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await softDeleteTag('not-a-uuid');

    expect(result.data).toBeNull();
    expect(result.error?.error_code).toBe('VALIDATION_ERROR');
    expect(client.from).not.toHaveBeenCalled();
  });

  it('returns UPDATE_FAILED when the database update errors', async () => {
    const chain = buildUpdateChain({ data: null, error: { message: 'boom' } });
    const client = buildClient({ auth: authedUser(), from: chain.from });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await softDeleteTag(TAG_ID);

    expect(result.data).toBeNull();
    expect(result.error?.error_code).toBe('UPDATE_FAILED');
  });
});

describe('listUserTags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function buildSelectChain(rows: unknown) {
    const range = jest.fn().mockResolvedValue({ data: rows, error: null });
    const order = jest.fn().mockReturnValue({ range });
    const isFn = jest.fn().mockReturnValue({ order });
    const select = jest.fn().mockReturnValue({ is: isFn });
    const from = jest.fn().mockReturnValue({ select });
    return { from, select, isFn, order, range };
  }

  it('returns tags ordered by created_at desc, excluding soft-deleted (default page=1, pageSize=50)', async () => {
    const rows = [
      {
        id: TAG_ID,
        user_id: USER_ID,
        name: 'Important',
        color: '#aabbcc',
        created_at: '2026-04-06T12:00:00.000Z',
        updated_at: '2026-04-06T12:00:00.000Z',
        deleted_at: null,
      },
    ];
    const chain = buildSelectChain(rows);
    const client = buildClient({ auth: authedUser(), from: chain.from });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await listUserTags();

    expect(result).toEqual({ data: rows, error: null });
    expect(chain.from).toHaveBeenCalledWith('tag');
    expect(chain.isFn).toHaveBeenCalledWith('deleted_at', null);
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(chain.range).toHaveBeenCalledWith(0, 49);
  });

  it('computes the correct offset/limit for page=3, pageSize=5 (range 10..14)', async () => {
    const chain = buildSelectChain([]);
    const client = buildClient({ auth: authedUser(), from: chain.from });
    mockedCreateClient.mockResolvedValue(client as never);

    await listUserTags({ page: 3, pageSize: 5 });

    expect(chain.range).toHaveBeenCalledWith(10, 14);
  });

  it('returns UNAUTHENTICATED when there is no user', async () => {
    const client = buildClient({ auth: noUser() });
    mockedCreateClient.mockResolvedValue(client as never);

    const result = await listUserTags();

    expect(result.data).toBeNull();
    expect(result.error?.error_code).toBe('UNAUTHENTICATED');
    expect(client.from).not.toHaveBeenCalled();
  });
});
