import { ImagePickerAsset } from "expo-image-picker";

import { supabase } from "@/lib/supabase";
import { getMimeType } from "@/utils/mimeTypes";
import { uriToArrayBuffer } from "@/utils/uploadFile";
import { ApiError } from "./errors";
import type {
  ChatCompleteDealResponse,
  ChatLeaveResponse,
  ChatListItem,
  ChatListResponse,
  ChatMediaMessage,
  ChatMediaSendResponse,
  ChatMessage,
  ChatMessageRequest,
  ChatMessageSendResponse,
  ChatMessagesResponse,
} from "./types";

const CHAT_BUCKET = "chat-media";
const SIGNED_URL_EXPIRES_IN = 60 * 60 * 24 * 7; // 7일

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new ApiError("인증이 필요합니다.", { code: "UNAUTHORIZED", status: 401 });
  }
  return user.id;
}

function mediaTypeFromName(name: string): "IMAGE" | "VIDEO" {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ["mp4", "mov", "avi", "webm"].includes(ext) ? "VIDEO" : "IMAGE";
}

export async function getChatListApi(_accessToken?: string): Promise<ChatListResponse> {
  const { data, error } = await supabase.rpc("list_my_chats");
  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }
  const items = (data as ChatListItem[] | null) ?? [];
  return { data: items, message: "채팅 목록 조회 성공" };
}

export async function getChatMessagesApi(
  chatId: number,
  _accessToken?: string,
): Promise<ChatMessagesResponse> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, sender_id, message, is_read, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  const messages: ChatMessage[] = (data ?? []).map((m) => ({
    message_id: m.id,
    sender_id: m.sender_id,
    content: m.message,
    is_read: m.is_read,
    created_at: m.created_at,
  }));

  // 입장 시 안 읽음 메시지 읽음 처리 (실패해도 메시지 조회는 성공으로 반환)
  await supabase.rpc("enter_chat_room", { p_chat_id: chatId }).then(({ error: rpcError }) => {
    if (rpcError) console.warn("enter_chat_room 실패", rpcError);
  });

  return { data: messages, message: "메시지 조회 성공" };
}

export async function sendMessageApi(
  chatId: number,
  request: ChatMessageRequest,
  _accessToken?: string,
): Promise<ChatMessageSendResponse> {
  const uid = await getCurrentUserId();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ chat_id: chatId, sender_id: uid, message: request.message })
    .select("id, sender_id, message, is_read, created_at")
    .single();

  if (error || !data) {
    throw new ApiError(error?.message ?? "메시지 전송에 실패했습니다.", {
      code: error?.code,
      status: 500,
    });
  }

  const message: ChatMessage = {
    message_id: data.id,
    sender_id: data.sender_id,
    content: data.message,
    is_read: data.is_read,
    created_at: data.created_at,
  };
  return { data: message, message: "메시지가 전송되었습니다." };
}

export async function leaveChatApi(
  chatId: number,
  _accessToken?: string,
): Promise<ChatLeaveResponse> {
  const { error } = await supabase.rpc("delete_chat_room", { p_chat_id: chatId });
  if (error) {
    if (error.message.includes("CHAT_ACCESS_DENIED")) {
      throw new ApiError("채팅방 접근 권한이 없습니다.", {
        code: "CHAT_ACCESS_DENIED",
        status: 401,
      });
    }
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }
  return { data: null, message: "채팅방을 나갔습니다." };
}

export async function completeDealApi(
  chatId: number,
  _accessToken?: string,
): Promise<ChatCompleteDealResponse> {
  const { error } = await supabase.rpc("confirm_trade", { p_chat_id: chatId });
  if (error) {
    if (error.message.includes("TRADE_NOT_AVAILABLE")) {
      throw new ApiError("거래 완료를 요청할 수 없는 상태입니다.", {
        code: "TRADE_NOT_AVAILABLE",
        status: 400,
      });
    }
    if (error.message.includes("ALREADY_CONFIRMED")) {
      throw new ApiError("이미 거래 완료를 확정하였습니다.", {
        code: "ALREADY_CONFIRMED",
        status: 409,
      });
    }
    if (error.message.includes("CHAT_ACCESS_DENIED")) {
      throw new ApiError("채팅방 접근 권한이 없습니다.", {
        code: "CHAT_ACCESS_DENIED",
        status: 401,
      });
    }
    if (error.message.includes("CHATROOM_NOT_FOUND")) {
      throw new ApiError("채팅방을 찾을 수 없습니다.", {
        code: "CHATROOM_NOT_FOUND",
        status: 404,
      });
    }
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }
  return { data: null, message: "거래 완료를 확정했습니다." };
}

export async function sendChatMediaApi(
  chatId: number,
  file: ImagePickerAsset,
  _accessToken?: string,
): Promise<ChatMediaSendResponse> {
  const uid = await getCurrentUserId();
  const filename = file.uri.split("/").pop() ?? "upload.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const contentType = getMimeType(filename);
  const mediaType = mediaTypeFromName(filename);
  const path = `${chatId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const buffer = await uriToArrayBuffer(file.uri);
  const { error: uploadError } = await supabase.storage
    .from(CHAT_BUCKET)
    .upload(path, buffer, { contentType, upsert: false });

  if (uploadError) {
    throw new ApiError(uploadError.message, { code: "FILE_UPLOAD_FAILED", status: 500 });
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(CHAT_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);

  if (signedError || !signed) {
    await supabase.storage.from(CHAT_BUCKET).remove([path]);
    throw new ApiError(signedError?.message ?? "미디어 URL 생성에 실패했습니다.", {
      code: "FILE_UPLOAD_FAILED",
      status: 500,
    });
  }

  const mediaUrl = signed.signedUrl;
  const { data: row, error: insertError } = await supabase
    .from("chat_messages")
    .insert({ chat_id: chatId, sender_id: uid, message: mediaUrl })
    .select("id, sender_id, message, is_read, created_at")
    .single();

  if (insertError || !row) {
    await supabase.storage.from(CHAT_BUCKET).remove([path]);
    throw new ApiError(insertError?.message ?? "메시지 저장에 실패했습니다.", {
      code: insertError?.code,
      status: 500,
    });
  }

  const mediaMessage: ChatMediaMessage = {
    message_id: row.id,
    sender_id: row.sender_id,
    content: row.message,
    media_url: mediaUrl,
    media_type: mediaType,
    is_read: row.is_read,
    created_at: row.created_at,
  };
  return { data: mediaMessage, message: "미디어가 전송되었습니다." };
}
