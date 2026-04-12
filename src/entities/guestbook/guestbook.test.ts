import type { Database } from '@/libs/supabase/types';

import { GuestbookEntry, GuestbookEntryInput } from './types';

describe('GuestbookEntryInput schema', () => {
  it('accepts a valid message', () => {
    const result = GuestbookEntryInput.safeParse({ message: 'Hello, world!' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty message', () => {
    const result = GuestbookEntryInput.safeParse({ message: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a message longer than 280 characters', () => {
    const result = GuestbookEntryInput.safeParse({ message: 'x'.repeat(281) });
    expect(result.success).toBe(false);
  });

  it('accepts a message exactly 280 characters long', () => {
    const result = GuestbookEntryInput.safeParse({ message: 'x'.repeat(280) });
    expect(result.success).toBe(true);
  });
});

describe('GuestbookEntry schema', () => {
  const validRow = {
    id: '00000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000002',
    message: 'Hello, world!',
    created_at: '2026-04-12T00:00:00.000Z',
    updated_at: '2026-04-12T00:00:00.000Z',
    deleted_at: null,
  };

  it('accepts a valid row', () => {
    const result = GuestbookEntry.safeParse(validRow);
    expect(result.success).toBe(true);
  });

  it('accepts a soft-deleted row (non-null deleted_at)', () => {
    const result = GuestbookEntry.safeParse({
      ...validRow,
      deleted_at: '2026-04-12T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('matches the generated Supabase `guestbook` Row type', () => {
    // This test is a compile-time assertion: if the generated `guestbook` Row
    // type does not line up with the Zod schema, TypeScript refuses to assign
    // one to the other and the test file fails to compile.
    type Row = Database['public']['Tables']['guestbook']['Row'];
    const row: Row = {
      id: validRow.id,
      user_id: validRow.user_id,
      message: validRow.message,
      created_at: validRow.created_at,
      updated_at: validRow.updated_at,
      deleted_at: validRow.deleted_at,
    };
    const parsed: GuestbookEntry = GuestbookEntry.parse(row);
    const _assignable: Row = parsed;
    expect(_assignable.id).toBe(validRow.id);
  });
});
