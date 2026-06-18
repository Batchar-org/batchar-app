import type { ApiResponse } from '@/types/common';

export type BlockSummary = {
  block_id: number;
  blocked_id: number;
  blocked_name: string;
  blocked_profile_image_url: string | null;
  created_at: string;
};

export type BlockListResponse = ApiResponse<BlockSummary[]>;
export type BlockAddResponse = ApiResponse<{ block_id: number }>;
export type BlockRemoveResponse = ApiResponse<null>;
