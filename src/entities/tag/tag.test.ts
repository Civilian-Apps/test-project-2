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

  it('rejects a name longer than 40 characters', () => {
    const result = TagInput.safeParse({ ...validInput, name: 'a'.repeat(41) });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid hex color (missing #)', () => {
    const result = TagInput.safeParse({ ...validInput, color: 'aabbcc' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid hex color (3-digit shorthand)', () => {
    const result = TagInput.safeParse({ ...validInput, color: '#abc' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-hex color string', () => {
    const result = TagInput.safeParse({ ...validInput, color: '#ggghhh' });
    expect(result.success).toBe(false);
  });

  it('accepts uppercase hex digits', () => {
    const result = TagInput.safeParse({ ...validInput, color: '#AABBCC' });
    expect(result.success).toBe(true);
  });
});

describe('Tag schema', () => {
  it('accepts a full tag row', () => {
    const result = Tag.safeParse({
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      name: 'Important',
      color: '#aabbcc',
      created_at: '2026-04-06T00:00:00Z',
      deleted_at: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-uuid id', () => {
    const result = Tag.safeParse({
      id: 'not-a-uuid',
      user_id: '00000000-0000-0000-0000-000000000002',
      name: 'Important',
      color: '#aabbcc',
      created_at: '2026-04-06T00:00:00Z',
      deleted_at: null,
    });
    expect(result.success).toBe(false);
  });
});

describe('Tag generated DB type', () => {
  it('matches the Zod-inferred shape (compile-time)', () => {
    type Row = Database['public']['Tables']['tag']['Row'];
    const row: Row = {
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000002',
      name: 'Important',
      color: '#aabbcc',
      created_at: '2026-04-06T00:00:00Z',
      updated_at: '2026-04-06T00:00:00Z',
      deleted_at: null,
    };
    const parsed = Tag.safeParse(row);
    expect(parsed.success).toBe(true);
  });
});
