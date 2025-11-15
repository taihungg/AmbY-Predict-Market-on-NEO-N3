// Transaction handler for Neo N3 smart contract interactions

export interface Argument {
  type:
    | "String"
    | "Boolean"
    | "Hash160"
    | "Hash256"
    | "Integer"
    | "ByteArray"
    | "Array"
    | "Address";
  value: any;
}

export interface Signer {
  account: string; // script hash of the address
  scopes: number; // effective range of the signature
  allowedContracts?: string[];
  allowedGroups?: string[];
}

export interface InvokeReadParams {
  scriptHash: string;
  operation: string;
  args: Argument[];
  signers: Signer[];
}

export interface InvokeParams {
  scriptHash: string;
  operation: string;
  args: Argument[];
  fee?: string;
  extraSystemFee?: string;
  overrideSystemFee?: string;
  broadcastOverride?: boolean;
  signers: Signer[];
}

export interface InvokeReadResponse {
  script: string;
  state: string;
  gas_consumed: string;
  stack: Argument[];
}

export interface InvokeResponse {
  txid: string;
  nodeURL?: string;
  signedTx?: string;
}

/**
 * Invoke a read-only smart contract method
 * This does not modify blockchain state and does not require GAS
 */
export async function invokeRead(
  neolineN3: any,
  params: InvokeReadParams
): Promise<InvokeReadResponse> {
  const result = await neolineN3.invokeRead(params);
  return result;
}

/**
 * Invoke a smart contract method that modifies blockchain state
 * This requires GAS fees and user approval
 */
export async function invoke(
  neolineN3: any,
  params: InvokeParams
): Promise<InvokeResponse> {
  const result = await neolineN3.invoke(params);
  return result;
}

/**
 * Helper: Create a signer with CalledByEntry scope (most common)
 */
export function createSigner(scriptHash: string): Signer {
  return {
    account: scriptHash,
    scopes: 1, // CalledByEntry
  };
}

/**
 * Helper: Create a signer with custom contracts scope
 */
export function createSignerWithContracts(
  scriptHash: string,
  allowedContracts: string[]
): Signer {
  return {
    account: scriptHash,
    scopes: 16, // CustomContracts
    allowedContracts,
  };
}

/**
 * Helper: Convert address to script hash (for use in signers)
 */
export async function addressToScriptHash(
  neolineN3: any,
  address: string
): Promise<string> {
  const result = await neolineN3.AddressToScriptHash({ address });
  return result.scriptHash;
}

/**
 * Helper: Convert script hash to address
 */
export async function scriptHashToAddress(
  neolineN3: any,
  scriptHash: string
): Promise<string> {
  const result = await neolineN3.ScriptHashToAddress({ scriptHash });
  return result.address;
}

// Common argument type helpers
export const ArgTypes = {
  string: (value: string): Argument => ({ type: "String", value }),
  boolean: (value: boolean): Argument => ({ type: "Boolean", value }),
  integer: (value: string | number): Argument => ({
    type: "Integer",
    value: value.toString(),
  }),
  address: (value: string): Argument => ({ type: "Address", value }),
  hash160: (value: string): Argument => ({ type: "Hash160", value }),
  hash256: (value: string): Argument => ({ type: "Hash256", value }),
  byteArray: (value: string): Argument => ({ type: "ByteArray", value }),
  array: (value: Argument[]): Argument => ({ type: "Array", value }),
  any: (): Argument => ({ type: "String", value: null }),
};

// Scope constants
export const Scopes = {
  None: 0, // No contracts allowed
  CalledByEntry: 1, // Only entry contract (recommended default)
  CustomContracts: 16, // Specific contracts
  CustomGroups: 32, // Specific contract groups
  WitnessRules: 64, // Custom witness rules
  Global: 128, // All contracts (high risk!)
};
