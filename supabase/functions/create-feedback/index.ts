// @ts-nocheck
/**
 * Deno entrypoint for the create-feedback edge function.
 *
 * Wires real Supabase + auth dependencies into the pure handler in
 * `./handler.ts`. The pure handler is what tests exercise — this file is
 * only run by the Deno runtime inside Supabase Edge Functions, so it is
 * excluded from the project's `tsc --noEmit` pass.
 *
 * REST shape:
 *   POST /functions/v1/create-feedback
 *   Headers: Authorization: Bearer <jwt>
 *            Idempotency-Key: <client-supplied key>   (optional)
 *   Body:    { subject: string, body: string }
 *
 *   200 -> { id, created_at }
 *   400 -> { error: { error_code: 'VALIDATION', message, fields } }
 *   401 -> { error: { error_code: 'UNAUTHENTICATED', message } }
 *   500 -> { error: { error_code: 'INSERT_FAILED', message } }
 *
 * MCP shape: see `createFeedbackTool` exported from `./handler.ts`.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.12';

import { type CreateFeedbackDeps,handleCreateFeedback } from './handler.ts';

export { createFeedbackTool } from './handler.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function buildDeps(authHeader: string | null): CreateFeedbackDeps {
  // User-scoped client: forwards the caller's JWT so RLS is enforced on
  // every read and write performed on the user's behalf.
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader ?? '' } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Service-role client used only to look up an existing idempotency record.
  // The lookup is explicitly scoped to the authenticated user_id, so we
  // never expose data across users.
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    async authenticate(header) {
      if (!header || !header.toLowerCase().startsWith('bearer ')) return null;
      const { data, error } = await userClient.auth.getUser();
      if (error || !data.user) return null;
      return { id: data.user.id };
    },

    async findByIdempotencyKey(userId, key) {
      const { data, error } = await adminClient
        .from('idempotency_keys')
        .select('resource_id, created_at')
        .eq('user_id', userId)
        .eq('key', key)
        .eq('resource_type', 'feedback')
        .maybeSingle();
      if (error || !data) return null;
      return { id: data.resource_id, created_at: data.created_at };
    },

    async insertFeedback(input) {
      const { data, error } = await userClient
        .from('feedback')
        .insert({
          user_id: input.user_id,
          subject: input.subject,
          body: input.body,
        })
        .select('id, created_at')
        .single();
      if (error || !data) return null;

      if (input.idempotency_key) {
        // Best-effort record of the idempotency key. If this insert races
        // with a concurrent retry, the unique index on
        // (user_id, key, resource_type) prevents duplicates and the next
        // call will hit the replay branch above.
        await adminClient.from('idempotency_keys').insert({
          user_id: input.user_id,
          key: input.idempotency_key,
          resource_type: 'feedback',
          resource_id: data.id,
        });
      }

      return { id: data.id, created_at: data.created_at };
    },
  };
}

Deno.serve(async (req: Request) => {
  const deps = buildDeps(req.headers.get('Authorization'));
  return handleCreateFeedback(req, deps);
});
