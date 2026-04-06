'use server';

import { z } from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

import { Tag, TagInput } from './types';

type ActionError = { error_code: string; message: string };
type ActionResult<T> = { data: T; error: null } | { data: null; error: ActionError };

const TagId = z.string().uuid();

export async function createTag(input: TagInput): Promise<ActionResult<Tag>> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { error_code: 'UNAUTHENTICATED', message: 'Sign in to create tags' },
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

  // Cast through unknown to avoid issues with the SSR client's generated
  // Insert types collapsing under newer postgrest-js versions.
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

export async function softDeleteTag(id: string): Promise<ActionResult<Tag>> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { error_code: 'UNAUTHENTICATED', message: 'Sign in to delete tags' },
    };
  }

  const parsedId = TagId.safeParse(id);
  if (!parsedId.success) {
    return {
      data: null,
      error: { error_code: 'VALIDATION_ERROR', message: 'Tag id is invalid.' },
    };
  }

  const fromTag = supabase.from('tag') as unknown as {
    update: (row: { deleted_at: string }) => {
      eq: (
        column: string,
        value: string
      ) => {
        eq: (
          column: string,
          value: string
        ) => {
          select: () => {
            single: () => Promise<{ data: Tag | null; error: { message: string } | null }>;
          };
        };
      };
    };
  };

  const { data, error } = await fromTag
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', parsedId.data)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) {
    return {
      data: null,
      error: {
        error_code: 'UPDATE_FAILED',
        message: 'Could not delete tag. Please try again.',
      },
    };
  }

  return { data: data as Tag, error: null };
}
