export type WalletEntry = {
  id: string;
  orderId: string;
  amount: number;
  date: string;
  reference: string;
};

export type WalletOverview = {
  ownerId: string;
  ownerEmail?: string;
  balance: number;
  count: number;
  entries: WalletEntry[];
  page: number;
  hasMore: boolean;
};
