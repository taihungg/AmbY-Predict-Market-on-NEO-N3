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
  contractScriptHash: string,
  userAddress: string,
  marketId: number,
  outcome: "Yes" | "No",
  amount: string
): Promise<string> {
  try {
    const userScriptHash = await addressToScriptHash(neolineN3, userAddress);
    const intOutcome = outcome === "Yes" ? 1 : 2;
    const params: InvokeParams = {
      scriptHash: contractScriptHash,
      operation: "onNEP17Payment",
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

export async function createMarket(
  neolineN3: any,
  contractScriptHash: string,
  userAddress: string
): Promise<string> {
  try {
    const userScriptHash = await addressToScriptHash(neolineN3, userAddress);
    const endTime = 1764136800000;
    const params: InvokeParams = {
      scriptHash: contractScriptHash,
      operation: "createMarket",
      args: [
        ArgTypes.hash160("ABC"),
        ArgTypes.integer("XYZ"),
        ArgTypes.integer(endTime),
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
