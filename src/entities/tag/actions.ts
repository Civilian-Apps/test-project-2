'use server';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

import { Tag, TagInput } from './types';

type ActionError = { error_code: string; message: string };
type ActionResult<T> = { data: T; error: null } | { data: null; error: ActionError };

export async function createTag(input: TagInput): Promise<ActionResult<Tag>> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { error_code: 'UNAUTHENTICATED', message: 'Sign in to manage tags' },
    };
  }

  const parsed = TagInput.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        error_code: 'VALIDATION_ERROR',
        message: 'Tag is invalid. Check the name and color and try again.',
      },
    };
  }

  const insertRow = {
    name: parsed.data.name,
    color: parsed.data.color,
    user_id: user.id,
  };

  const fromTag = supabase.from('tag') as unknown as {
    insert: (row: typeof insertRow) => {
      select: () => {
        single: () => Promise<{ data: Tag | null; error: { message: string } | null }>;
      };
    };
  };

  const { data, error } = await fromTag.insert(insertRow).select().single();

  if (error || !data) {
    return {
      data: null,
      error: {
        error_code: 'INSERT_FAILED',
        message: 'Could not save tag. Please try again.',
      },
    };
  }

  return { data: data as Tag, error: null };
}

export async function softDeleteTag(input: { id: string }): Promise<ActionResult<{ id: string }>> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { error_code: 'UNAUTHENTICATED', message: 'Sign in to manage tags' },
    };
  }

  if (!input?.id || typeof input.id !== 'string') {
    return {
      data: null,
      error: { error_code: 'VALIDATION_ERROR', message: 'Tag id is required' },
    };
  }

  const fromTag = supabase.from('tag') as unknown as {
    update: (row: { deleted_at: string }) => {
      eq: (
        col: string,
        val: string
      ) => {
        eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  };

  const { error } = await fromTag
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', input.id)
    .eq('user_id', user.id);

  if (error) {
    return {
      data: null,
      error: {
        error_code: 'DELETE_FAILED',
        message: 'Could not remove tag. Please try again.',
      },
    };
  }

  return { data: { id: input.id }, error: null };
}
