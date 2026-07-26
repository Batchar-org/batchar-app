import { useQuery } from '@tanstack/react-query';

import { getBlockListApi } from '@/services/block';
import { blockKeys } from '@/queries/keys';

export function useBlockListQuery() {
  return useQuery({
    queryKey: blockKeys.list,
    queryFn: async () => {
      const res = await getBlockListApi();
      return res.data;
    },
  });
}
