export function isProductClosedForDisplay(status?: string, endTime?: string): boolean {
  const isExpired = endTime ? new Date(endTime).getTime() <= Date.now() : false;
  return (
    status === 'ENDED' ||
    status === 'FAILED' ||
    status === 'TRADED' ||
    status === 'CANCELED' ||
    (status === 'ON_SALE' && isExpired)
  );
}

export function getProductDisplayStatus(status?: string): string | undefined {
  if (status === 'ENDED' || status === 'TRADED') return status;
  return undefined;
}
