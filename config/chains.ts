export const CHAINS = {
  BASE:    { caip2: "eip155:8453",  rpc: process.env.BASE_RPC_URL!,  name: "Base Mainnet" },
  POLYGON: { caip2: "eip155:137",   rpc: "https://polygon-rpc.com",  name: "Polygon" },
  TEMPO:   { caip2: "eip155:19012", rpc: process.env.TEMPO_RPC_URL!, name: "Tempo" },
} as const;

export type ChainKey = keyof typeof CHAINS;