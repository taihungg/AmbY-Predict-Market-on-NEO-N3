import {
  invokeRead,
  createSigner,
  addressToScriptHash,
  ArgTypes,
  type InvokeReadParams,
} from "../utils/transaction";

export async function getTVL(
  neolineN3: any,
  contractAddress: string,
  userAddress: string,
  marketId: number
) {
  try {
    const userScriptHash = await addressToScriptHash(neolineN3, userAddress);
    const contractScriptHash = await addressToScriptHash(
      neolineN3,
      contractAddress
    );
    const params: InvokeReadParams = {
      scriptHash: contractScriptHash,
      operation: "viewTVL",
      args: [ArgTypes.integer(marketId)],
      signers: [createSigner(userScriptHash)],
    };
    const result = await invokeRead(neolineN3, params);
    return result.stack.values;
  } catch (error) {
    console.error("Failed to get quest details:", error);
    throw error;
  }
}

export async function getYesPoint(
  neolineN3: any,
  contractAddress: string,
  userAddress: string,
  marketId: number
) {
  try {
    const userScriptHash = await addressToScriptHash(neolineN3, userAddress);
    const contractScriptHash = await addressToScriptHash(
      neolineN3,
      contractAddress
    );
    const params: InvokeReadParams = {
      scriptHash: contractScriptHash,
      operation: "totalYesPoint",
      args: [ArgTypes.integer(marketId)],
      signers: [createSigner(userScriptHash)],
    };
    const result = await invokeRead(neolineN3, params);
    return result.stack.values;
  } catch (error) {
    console.error("Failed to get quest details:", error);
    throw error;
  }
}

export async function getNoPoint(
  neolineN3: any,
  contractAddress: string,
  userAddress: string,
  marketId: number
) {
  try {
    const userScriptHash = await addressToScriptHash(neolineN3, userAddress);
    const contractScriptHash = await addressToScriptHash(
      neolineN3,
      contractAddress
    );
    const params: InvokeReadParams = {
      scriptHash: contractScriptHash,
      operation: "totalNoPoint",
      args: [ArgTypes.integer(marketId)],
      signers: [createSigner(userScriptHash)],
    };
    const result = await invokeRead(neolineN3, params);
    return result.stack.values;
  } catch (error) {
    console.error("Failed to get quest details:", error);
    throw error;
  }
}

export async function getPotentialReward(
  neolineN3: any,
  contractAddress: string,
  userAddress: string,
  marketId: number,
  outcome: "Yes" | "No",
  amount: string
) {
  try {
    const userScriptHash = await addressToScriptHash(neolineN3, userAddress);
    const contractScriptHash = await addressToScriptHash(
      neolineN3,
      contractAddress
    );
    const params: InvokeReadParams = {
      scriptHash: contractScriptHash,
      operation: "potentialReward",
      args: [
        ArgTypes.integer(marketId),
        ArgTypes.integer(outcome === "Yes" ? 1 : 0),
        ArgTypes.integer(amount),
      ],
      signers: [createSigner(userScriptHash)],
    };
    const result = await invokeRead(neolineN3, params);
    return result.stack.values;
  } catch (error) {
    console.error("Failed to get quest details:", error);
    throw error;
  }
}
