import { ImagePickerAsset } from "expo-image-picker";

import { supabase } from "@/lib/supabase";
import { getMimeType } from "@/utils/mimeTypes";
import { uriToArrayBuffer } from "@/utils/uploadFile";
import { ApiError } from "./errors";
import type {
  ProductCloseResponse,
  ProductCreateRequest,
  ProductCreateResponse,
  ProductDeleteResponse,
  ProductDetail,
  ProductDetailResponse,
  ProductListParams,
  ProductListResponse,
  ProductMediaInfo,
  ProductSummary,
  ProductUpdateRequest,
  ProductUpdateResponse,
} from "./types";

const PRODUCT_BUCKET = "product-media";

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new ApiError("인증이 필요합니다.", { code: "UNAUTHORIZED", status: 401 });
  }
  return user.id;
}

function mediaTypeFromName(name: string): "IMAGE" | "VIDEO" {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "VIDEO";
  return "IMAGE";
}

async function uploadProductMedia(
  uid: string,
  file: ImagePickerAsset,
): Promise<{ url: string; type: "IMAGE" | "VIDEO"; path: string }> {
  const filename = file.uri.split("/").pop() ?? "upload.jpg";
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const today = new Date().toISOString().slice(0, 10);
  const path = `${today}/${uid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const contentType = getMimeType(filename);

  const buffer = await uriToArrayBuffer(file.uri);
  const { error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(path, buffer, { contentType, upsert: false });

  if (error) {
    throw new ApiError(error.message, { code: "FILE_UPLOAD_FAILED", status: 500 });
  }

  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, type: mediaTypeFromName(filename), path };
}

function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const marker = `/${PRODUCT_BUCKET}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx < 0) return null;
    return url.pathname.slice(idx + marker.length);
  } catch {
    return null;
  }
}

export async function createProductApi(
  request: ProductCreateRequest,
  files: ImagePickerAsset[],
  _accessToken?: string,
): Promise<ProductCreateResponse> {
  if (files.length === 0) {
    throw new ApiError("상품 미디어는 최소 1개 이상이어야 합니다.", {
      code: "PRODUCT_MEDIA_REQUIRED",
      status: 400,
    });
  }

  const uid = await getCurrentUserId();

  const uploaded: { url: string; type: "IMAGE" | "VIDEO"; path: string }[] = [];
  try {
    for (const file of files) {
      uploaded.push(await uploadProductMedia(uid, file));
    }
  } catch (e) {
    await supabase.storage.from(PRODUCT_BUCKET).remove(uploaded.map((u) => u.path));
    throw e;
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      seller_id: uid,
      title: request.title,
      description: request.description,
      category: request.category,
      start_price: request.startPrice,
      current_price: request.startPrice,
      end_time: request.endTime,
    })
    .select("id")
    .single();

  if (productError || !product) {
    await supabase.storage.from(PRODUCT_BUCKET).remove(uploaded.map((u) => u.path));
    throw new ApiError(productError?.message ?? "상품 등록에 실패했습니다.", {
      code: productError?.code,
      status: 500,
    });
  }

  const { error: mediaError } = await supabase.from("product_media").insert(
    uploaded.map((u) => ({
      product_id: product.id,
      media_url: u.url,
      media_type: u.type,
    })),
  );

  if (mediaError) {
    await supabase.from("products").delete().eq("id", product.id);
    await supabase.storage.from(PRODUCT_BUCKET).remove(uploaded.map((u) => u.path));
    throw new ApiError(mediaError.message, { code: mediaError.code, status: 500 });
  }

  return {
    data: { product_id: product.id },
    message: "상품이 등록되었습니다.",
  };
}

export async function getProductsApi(
  params: ProductListParams = {},
  _accessToken?: string | null,
): Promise<ProductListResponse> {
  const { data, error } = await supabase.rpc("list_products", {
    p_view: params.view ?? "ALL",
    p_category: params.category ?? undefined,
    p_keyword: params.keyword ?? undefined,
    p_page: params.page ?? 0,
    p_size: params.size ?? 20,
  });

  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  const payload = data as { items: ProductSummary[]; has_next: boolean };
  return {
    data: { content: payload.items, has_next: payload.has_next },
    message: "상품 목록 조회 성공",
  };
}

export async function getProductDetailApi(
  productId: number,
  _accessToken?: string | null,
): Promise<ProductDetailResponse> {
  const { data, error } = await supabase.rpc("get_product_detail", {
    p_product_id: productId,
  });

  if (error) {
    if (error.code === "P0002") {
      throw new ApiError("상품을 찾을 수 없습니다.", { code: "PRODUCT_NOT_FOUND", status: 404 });
    }
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  const raw = data as {
    product_id: number;
    seller_id: string;
    seller_name: string;
    seller_profile_image_url: string | null;
    title: string;
    description: string;
    category: string;
    start_price: number;
    current_price: number;
    is_top_bidder: boolean;
    is_wished: boolean;
    status: string;
    start_time: string;
    end_time: string;
    wish_count: number;
    bid_count: number;
    media_urls: { id: number; media_url: string; media_type: "IMAGE" | "VIDEO" }[];
  };

  const detail: ProductDetail = {
    product_id: raw.product_id,
    seller_id: raw.seller_id,
    seller_name: raw.seller_name,
    seller_profile_image_url: raw.seller_profile_image_url,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    start_price: raw.start_price,
    current_price: raw.current_price,
    is_top_bidder: raw.is_top_bidder,
    status: raw.status,
    start_time: raw.start_time,
    end_time: raw.end_time,
    is_wished: raw.is_wished,
    wish_count: raw.wish_count,
    bid_count: raw.bid_count,
    media_urls: raw.media_urls.map((m): ProductMediaInfo => ({ id: m.id, url: m.media_url })),
  };

  return { data: detail, message: "상품 상세 조회 성공" };
}

export async function updateProductApi(
  productId: number,
  request: ProductUpdateRequest,
  files: ImagePickerAsset[],
  _accessToken?: string,
): Promise<ProductUpdateResponse> {
  const uid = await getCurrentUserId();

  const patch: {
    title?: string;
    description?: string;
    category?: string;
    end_time?: string;
  } = {};
  if (request.title !== undefined) patch.title = request.title;
  if (request.description !== undefined) patch.description = request.description;
  if (request.category !== undefined) patch.category = request.category;
  if (request.endTime !== undefined) patch.end_time = request.endTime;

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", productId)
      .eq("seller_id", uid);
    if (error) {
      throw new ApiError(error.message, { code: error.code, status: 500 });
    }
  }

  if (request.deleteMediaIds && request.deleteMediaIds.length > 0) {
    const { data: toDelete } = await supabase
      .from("product_media")
      .select("id, media_url")
      .in("id", request.deleteMediaIds)
      .eq("product_id", productId);

    if (toDelete && toDelete.length > 0) {
      const paths = toDelete
        .map((m) => extractStoragePath(m.media_url))
        .filter((p): p is string => p !== null);
      if (paths.length > 0) {
        await supabase.storage.from(PRODUCT_BUCKET).remove(paths);
      }
      await supabase
        .from("product_media")
        .delete()
        .in(
          "id",
          toDelete.map((m) => m.id),
        );
    }
  }

  if (files.length > 0) {
    const uploaded: { url: string; type: "IMAGE" | "VIDEO"; path: string }[] = [];
    try {
      for (const file of files) {
        uploaded.push(await uploadProductMedia(uid, file));
      }
    } catch (e) {
      await supabase.storage.from(PRODUCT_BUCKET).remove(uploaded.map((u) => u.path));
      throw e;
    }
    const { error: insertError } = await supabase.from("product_media").insert(
      uploaded.map((u) => ({
        product_id: productId,
        media_url: u.url,
        media_type: u.type,
      })),
    );
    if (insertError) {
      await supabase.storage.from(PRODUCT_BUCKET).remove(uploaded.map((u) => u.path));
      throw new ApiError(insertError.message, { code: insertError.code, status: 500 });
    }
  }

  return getProductDetailApi(productId);
}

export async function closeProductApi(
  productId: number,
  _accessToken?: string,
): Promise<ProductCloseResponse> {
  const { error } = await supabase.rpc("close_auction_manual", { p_product_id: productId });
  if (error) {
    if (error.message.includes("AUCTION_CLOSED")) {
      throw new ApiError("이미 마감된 경매입니다.", {
        code: "AUCTION_ALREADY_CLOSED",
        status: 400,
      });
    }
    if (error.message.includes("NOT_SELLER")) {
      throw new ApiError("본인 상품만 경매 마감을 할 수 있습니다.", {
        code: "PRODUCT_CLOSE_FORBIDDEN",
        status: 403,
      });
    }
    if (error.message.includes("PRODUCT_NOT_FOUND")) {
      throw new ApiError("상품을 찾을 수 없습니다.", { code: "PRODUCT_NOT_FOUND", status: 404 });
    }
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }
  return { data: undefined, message: "경매가 마감되었습니다." };
}

export async function deleteProductApi(
  productId: number,
  _accessToken?: string,
): Promise<ProductDeleteResponse> {
  const uid = await getCurrentUserId();

  const { data: mediaRows } = await supabase
    .from("product_media")
    .select("media_url")
    .eq("product_id", productId);

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("seller_id", uid);

  if (error) {
    throw new ApiError(error.message, { code: error.code, status: 500 });
  }

  if (mediaRows && mediaRows.length > 0) {
    const paths = mediaRows
      .map((m) => extractStoragePath(m.media_url))
      .filter((p): p is string => p !== null);
    if (paths.length > 0) {
      await supabase.storage.from(PRODUCT_BUCKET).remove(paths);
    }
  }

  return { data: { product_id: productId }, message: "상품이 삭제되었습니다." };
}
