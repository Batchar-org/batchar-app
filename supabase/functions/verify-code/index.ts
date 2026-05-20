import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { errorResponse, handleOptions, jsonResponse } from '../_shared/response.ts';
import { createAdminClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return handleOptions(req);
  if (req.method !== 'POST') {
    return errorResponse(req, 'METHOD_NOT_ALLOWED', '지원하지 않는 HTTP 메서드입니다.', 405);
  }

  let body: { email?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, 'INVALID_JSON_FORMAT', 'JSON 형식이 올바르지 않습니다.', 400);
  }

  const email = body.email?.trim().toLowerCase();
  const code = body.code?.trim();
  if (!email || !code) {
    return errorResponse(req, 'INVALID_INPUT_VALUE', '입력값이 올바르지 않습니다.', 400);
  }

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from('email_verifications')
    .select('code, code_expires_at')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('select email_verifications failed', error);
    return errorResponse(req, 'INTERNAL_SERVER_ERROR', '서버 내부 오류가 발생했습니다.', 500);
  }

  const expired = !row?.code_expires_at || new Date(row.code_expires_at).getTime() <= Date.now();
  if (!row || !row.code || expired || row.code !== code) {
    return errorResponse(req, 'INVALID_VERIFICATION_CODE', '인증 코드가 올바르지 않습니다.', 400);
  }

  const verifiedExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const { error: updateError } = await admin
    .from('email_verifications')
    .update({
      code: null,
      verified: true,
      code_expires_at: null,
      verified_expires_at: verifiedExpiresAt,
    })
    .eq('email', email);

  if (updateError) {
    console.error('update verified failed', updateError);
    return errorResponse(req, 'INTERNAL_SERVER_ERROR', '서버 내부 오류가 발생했습니다.', 500);
  }

  return jsonResponse(req, { email });
});
