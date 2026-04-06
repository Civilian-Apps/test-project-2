import type { Database } from '@/libs/supabase/types';

import { Feedback, FeedbackInput } from './types';

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
