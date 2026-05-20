import { useQuery } from '@tanstack/react-query';

import { getBlockListApi } from '@/api/block';

export function useBlockListQuery() {
  return useQuery({
    queryKey: ['blockList'],
    queryFn: async () => {
      const res = await getBlockListApi();
      return res.data;
    },
  });
}
