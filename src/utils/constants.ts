export type Message = {
  from: string;
  message: string;
  timestamp: number;
};

export type Block = {
  data: string;
  timestamp: number;
  signature: string;
  prevHash: string;

  // Proof of Stake
  nonce: number;
  hash: string;
};
