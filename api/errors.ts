export class ApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, opts?: { code?: string; status?: number }) {
    super(message);
    this.name = "ApiError";
    this.code = opts?.code;
    this.status = opts?.status;
  }
}

const SUPABASE_AUTH_MESSAGE_MAP: Record<string, { code: string; message: string }> = {
  "Invalid login credentials": {
    code: "INVALID_CREDENTIALS",
    message: "이메일 또는 비밀번호가 올바르지 않습니다.",
  },
  "Email not confirmed": {
    code: "EMAIL_NOT_VERIFIED",
    message: "이메일 인증이 완료되지 않았습니다.",
  },
  "User already registered": {
    code: "DUPLICATE_EMAIL",
    message: "이미 존재하는 이메일입니다.",
  },
};

export function mapSupabaseAuthError(message: string, status?: number): ApiError {
  const mapped = SUPABASE_AUTH_MESSAGE_MAP[message];
  if (mapped) return new ApiError(mapped.message, { code: mapped.code, status });
  return new ApiError(message || "요청에 실패했습니다.", { status });
}

export function throwFromEdgeFunction(payload: unknown, status: number): never {
  if (payload && typeof payload === "object") {
    const obj = payload as { code?: string; message?: string };
    throw new ApiError(obj.message ?? `요청에 실패했습니다. status=${status}`, {
      code: obj.code,
      status,
    });
  }
  throw new ApiError(`요청에 실패했습니다. status=${status}`, { status });
}
