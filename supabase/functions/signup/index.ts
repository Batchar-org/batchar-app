import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { errorResponse, handleOptions, jsonResponse } from '../_shared/response.ts';
import { createAdminClient, getEmailDomain, VALID_EMAIL_DOMAINS } from '../_shared/supabase.ts';

type SignupBody = {
  email?: string;
  password?: string;
  name?: string;
  address?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return handleOptions(req);
  if (req.method !== 'POST') {
    return errorResponse(req, 'METHOD_NOT_ALLOWED', '지원하지 않는 HTTP 메서드입니다.', 405);
  }

  let body: SignupBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, 'INVALID_JSON_FORMAT', 'JSON 형식이 올바르지 않습니다.', 400);
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const name = body.name?.trim();
  const address = body.address?.trim();

  if (!email || !password || !name || !address) {
    return errorResponse(req, 'INVALID_INPUT_VALUE', '입력값이 올바르지 않습니다.', 400);
  }

  const domain = getEmailDomain(email);
  if (!domain || !VALID_EMAIL_DOMAINS.has(domain)) {
    return errorResponse(req, 'INVALID_EMAIL_DOMAIN', '한밭대학교 이메일만 가입 가능합니다.', 400);
  }

  const admin = createAdminClient();

  const { data: verification } = await admin
    .from('email_verifications')
    .select('verified, verified_expires_at')
    .eq('email', email)
    .maybeSingle();

  const verifiedValid =
    verification?.verified &&
    verification.verified_expires_at &&
    new Date(verification.verified_expires_at).getTime() > Date.now();

  if (!verifiedValid) {
    return errorResponse(req, 'EMAIL_NOT_VERIFIED', '이메일 인증이 완료되지 않았습니다.', 400);
  }

  const { data: dupEmail } = await admin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (dupEmail) {
    return errorResponse(req, 'DUPLICATE_EMAIL', '이미 존재하는 이메일입니다.', 409);
  }

  const { data: dupName } = await admin.from('users').select('id').eq('name', name).maybeSingle();
  if (dupName) {
    return errorResponse(req, 'DUPLICATE_NAME', '이미 사용 중인 닉네임입니다.', 409);
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    console.error('createUser failed', createError);
    return errorResponse(req, 'INTERNAL_SERVER_ERROR', '서버 내부 오류가 발생했습니다.', 500);
  }

  const userId = created.user.id;

  const { error: insertError } = await admin.from('users').insert({
    id: userId,
    email,
    name,
    address,
  });

  if (insertError) {
    console.error('insert public.users failed', insertError);
    await admin.auth.admin.deleteUser(userId);
    return errorResponse(req, 'INTERNAL_SERVER_ERROR', '서버 내부 오류가 발생했습니다.', 500);
  }

  await admin.from('email_verifications').delete().eq('email', email);

  return jsonResponse(req, { id: userId, email, name });
});
