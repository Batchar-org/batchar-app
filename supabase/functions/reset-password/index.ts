import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  errorResponse,
  handleOptions,
  jsonResponse,
} from "../_shared/response.ts";
import { buildTempPasswordHtml, sendEmail } from "../_shared/email.ts";
import {
  createAdminClient,
  generateTempPassword,
} from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions(req);
  if (req.method !== "POST") {
    return errorResponse(
      req,
      "METHOD_NOT_ALLOWED",
      "지원하지 않는 HTTP 메서드입니다.",
      405,
    );
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse(
      req,
      "INVALID_JSON_FORMAT",
      "JSON 형식이 올바르지 않습니다.",
      400,
    );
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return errorResponse(
      req,
      "INVALID_INPUT_VALUE",
      "입력값이 올바르지 않습니다.",
      400,
    );
  }

  const admin = createAdminClient();

  const { data: user } = await admin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    return errorResponse(
      req,
      "USER_NOT_FOUND",
      "사용자를 찾을 수 없습니다.",
      404,
    );
  }

  const tempPassword = generateTempPassword(10);

  const { error: updateError } = await admin.auth.admin.updateUserById(
    user.id,
    { password: tempPassword },
  );

  if (updateError) {
    console.error("updateUserById failed", updateError);
    return errorResponse(
      req,
      "INTERNAL_SERVER_ERROR",
      "서버 내부 오류가 발생했습니다.",
      500,
    );
  }

  try {
    await sendEmail(
      email,
      "[BatChar] 임시 비밀번호 발급",
      buildTempPasswordHtml(tempPassword),
    );
  } catch (e) {
    console.error("sendEmail failed", e);
    return errorResponse(
      req,
      "EMAIL_SEND_FAILED",
      "이메일 발송에 실패했습니다.",
      500,
    );
  }

  return jsonResponse(req, { email });
});
