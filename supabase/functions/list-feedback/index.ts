// Supabase Edge Function: list-feedback
//
// This file runs on Deno inside Supabase Edge Runtime. It is intentionally a
// thin wrapper around the pure `handleListFeedback` handler in
// `src/entities/feedback/list-feedback.ts`, which is unit-tested under Jest.
//
// Tool description and parameter descriptions for MCP discoverability are
// re-exported below (see rules/functions.md — every edge function is both a
// REST endpoint and an MCP tool).
//
// @ts-nocheck -- Deno globals (`Deno.serve`, `Deno.env`) and the esm.sh
// import specifier are not visible to the project's tsc; this file is
// excluded from the TypeScript project in tsconfig.json.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.12';

import { handleListFeedback, listFeedbackTool } from '../../../src/entities/feedback/list-feedback.ts';

export { listFeedbackTool };

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: { error_code: 'MISCONFIGURED' } }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization') ?? '';

  // User-scoped client — reads the caller's identity and app_metadata.role
  // for the admin check.
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Service-role client — used only after the admin check passes, so the
  // query can see every user's feedback. This exception is documented in
  // src/entities/feedback/definition.md.
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return handleListFeedback(req, { authClient, adminClient });
});
