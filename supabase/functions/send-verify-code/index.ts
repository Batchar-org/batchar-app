import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { errorResponse, handleOptions, jsonResponse } from '../_shared/response.ts';
import { buildVerificationHtml, sendEmail } from '../_shared/email.ts';
import {
  createAdminClient,
  generateSixDigitCode,
  getEmailDomain,
  VALID_EMAIL_DOMAINS,
} from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return handleOptions(req);
  if (req.method !== 'POST') {
    return errorResponse(req, 'METHOD_NOT_ALLOWED', '지원하지 않는 HTTP 메서드입니다.', 405);
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, 'INVALID_JSON_FORMAT', 'JSON 형식이 올바르지 않습니다.', 400);
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return errorResponse(req, 'INVALID_INPUT_VALUE', '입력값이 올바르지 않습니다.', 400);
  }

  const domain = getEmailDomain(email);
  if (!domain || !VALID_EMAIL_DOMAINS.has(domain)) {
    return errorResponse(req, 'INVALID_EMAIL_DOMAIN', '한밭대학교 이메일만 가입 가능합니다.', 400);
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return errorResponse(req, 'DUPLICATE_EMAIL', '이미 존재하는 이메일입니다.', 409);
  }

  const code = generateSixDigitCode();
  const codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error: upsertError } = await admin.from('email_verifications').upsert(
    {
      email,
      code,
      verified: false,
      code_expires_at: codeExpiresAt,
      verified_expires_at: null,
    },
    { onConflict: 'email' }
  );

  if (upsertError) {
    console.error('upsert email_verifications failed', upsertError);
    return errorResponse(req, 'INTERNAL_SERVER_ERROR', '서버 내부 오류가 발생했습니다.', 500);
  }

  try {
    await sendEmail(email, '[BatChar] 이메일 인증 코드', buildVerificationHtml(code));
  } catch (e) {
    console.error('sendEmail failed', e);
    return errorResponse(req, 'EMAIL_SEND_FAILED', '이메일 발송에 실패했습니다.', 500);
  }

  return jsonResponse(req, { email });
});
