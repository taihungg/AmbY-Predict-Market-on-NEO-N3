import {
  invoke,
  createSigner,
  addressToScriptHash,
  ArgTypes,
  type InvokeParams,
} from "../utils/transaction";

// Example: Vote on a prediction market quest
export async function voteOnQuest(
  neolineN3: any,
  contractAddress: string,
  userAddress: string,
  marketId: number,
  outcome: "Yes" | "No",
  amount: string
): Promise<string> {
  try {
    const userScriptHash = await addressToScriptHash(neolineN3, userAddress);
    const contractScriptHash = await addressToScriptHash(
      neolineN3,
      contractAddress
    );
    const intOutcome = outcome === "Yes" ? 1 : 0;
    const params: InvokeParams = {
      scriptHash: contractScriptHash,
      operation: "vote",
      args: [
        ArgTypes.hash160(userAddress),
        ArgTypes.integer(amount),
        ArgTypes.array([
          ArgTypes.integer(marketId),
          ArgTypes.integer(intOutcome),
        ]),
      ],
      signers: [createSigner(userScriptHash)],
    };
    const result = await invoke(neolineN3, params);
    return result.txid;
  } catch (error) {
    console.error("Vote failed:", error);
    throw error;
  }
}
