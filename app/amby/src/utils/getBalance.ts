interface BalanceResponse {
  contract: string;
  symbol: string;
  amount: string;
}

export async function getBalance(
  neolineN3: any
): Promise<{ [address: string]: BalanceResponse[] }> {
  const results = await neolineN3.getBalance();
  return results;
}
