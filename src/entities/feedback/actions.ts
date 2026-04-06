'use server';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

import { Feedback, FeedbackInput } from './types';

type ActionError = { error_code: string; message: string };
type ActionResult<T> = { data: T; error: null } | { data: null; error: ActionError };

export async function createFeedback(input: FeedbackInput): Promise<ActionResult<Feedback>> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { error_code: 'UNAUTHENTICATED', message: 'Sign in to send feedback' },
    };
  }

  const parsed = FeedbackInput.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        error_code: 'VALIDATION_ERROR',
        message: 'Feedback is invalid. Check the subject and body and try again.',
      },
    };
  }

  const insertRow = {
    subject: parsed.data.subject,
    body: parsed.data.body,
    user_id: user.id,
  };

  // Cast through unknown to avoid issues with the SSR client's generated
  // Insert types collapsing under newer postgrest-js versions.
  const fromFeedback = supabase.from('feedback') as unknown as {
    insert: (row: typeof insertRow) => {
      select: () => {
        single: () => Promise<{ data: Feedback | null; error: { message: string } | null }>;
      };
    };
  };

  const { data, error } = await fromFeedback.insert(insertRow).select().single();

  if (error || !data) {
    return {
      data: null,
      error: {
        error_code: 'INSERT_FAILED',
        message: 'Could not save feedback. Please try again.',
      },
    };
  }

  return { data: data as Feedback, error: null };
}
