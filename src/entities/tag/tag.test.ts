import type { Database } from '@/libs/supabase/types';

import { Tag, TagInput } from './types';

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
      deleted_at: null,
    };
    const result = Tag.safeParse(row);
    expect(result.success).toBe(true);
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
      deleted_at: null,
    };
    const parsed: Tag = row;
    expect(parsed.id).toBe(row.id);
  });
});
