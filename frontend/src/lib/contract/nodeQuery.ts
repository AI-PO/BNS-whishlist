// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { serialize } from "borsh";

const ARG_TYPE_TAG = {
  Int: 0,
  Str: 1,
  Bytes: 2,
  ListInt: 3,
  ListStr: 4,
};

function randomBytes16() {
  const out = new Uint8Array(16);
  crypto.getRandomValues(out);
  return out;
}

function bytesToHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function sha256Hex(bytes) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(hashBuffer));
}

function normalizeHex(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Expected non-empty hex string.");
  }
  const normalized = trimmed.replace(/^0x/i, "");
  if (!normalized) {
    throw new Error("Expected non-empty hex string.");
  }
  if (normalized.length % 2 !== 0) {
    throw new Error("Hex string must have an even number of characters.");
  }
  if (!/^[0-9a-fA-F]+$/.test(normalized)) {
    throw new Error("Hex string contains non-hex characters.");
  }
  return normalized.toLowerCase();
}

function hexToBytes(input) {
  const hex = normalizeHex(input);
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    const start = i * 2;
    out[i] = parseInt(hex.slice(start, start + 2), 16);
  }
  return out;
}

function ensureFixedBytes(input, expectedLen, label) {
  const bytes = hexToBytes(input);
  if (bytes.length !== expectedLen) {
    throw new Error(
      `${label} must be ${expectedLen} bytes, got ${bytes.length}.`
    );
  }
  return bytes;
}

function concatBytes(chunks) {
  const total = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function serializeVecU8(bytes) {
  const len = serialize("u32", bytes.length);
  return concatBytes([len, bytes]);
}

function serializeCallAuth() {
  const scheme = serialize("string", "secp256k1");
  const emptySigsLen = serialize("u32", 0);
  return concatBytes([scheme, emptySigsLen]);
}

function parseArg(arg, index) {
  const argType = String(arg.type).toLowerCase();

  if (argType === "int" || argType === "u64") {
    if (typeof arg.value !== "number" && typeof arg.value !== "bigint") {
      throw new Error(`Argument ${index} must be a non-negative integer.`);
    }
    const asBigInt = BigInt(arg.value);
    if (asBigInt < 0n) {
      throw new Error(`Argument ${index} must be a non-negative integer.`);
    }
    const data = serialize("u64", asBigInt);
    return { tag: ARG_TYPE_TAG.Int, data };
  }

  if (argType === "str" || argType === "string") {
    if (typeof arg.value !== "string") {
      throw new Error(`Argument ${index} must be a string.`);
    }
    const data = serialize("string", arg.value);
    return { tag: ARG_TYPE_TAG.Str, data };
  }

  if (argType === "bytes") {
    if (typeof arg.value !== "string") {
      throw new Error(`Argument ${index} must be a hex string.`);
    }
    const bytes = hexToBytes(arg.value);
    const data = serializeVecU8(bytes);
    return { tag: ARG_TYPE_TAG.Bytes, data };
  }

  if (argType === "list_int" || argType === "listint") {
    if (!Array.isArray(arg.value)) {
      throw new Error(`Argument ${index} must be an array of integers.`);
    }
    const parsed = arg.value.map((item, innerIndex) => {
      if (typeof item !== "number" && typeof item !== "bigint") {
        throw new Error(
          `Argument ${index}[${innerIndex}] must be a non-negative integer.`
        );
      }
      const value = BigInt(item);
      if (value < 0n) {
        throw new Error(
          `Argument ${index}[${innerIndex}] must be a non-negative integer.`
        );
      }
      return value;
    });
    const data = serialize({ array: { type: "u64" } }, parsed);
    return { tag: ARG_TYPE_TAG.ListInt, data };
  }

  if (argType === "list_str" || argType === "liststr") {
    if (!Array.isArray(arg.value)) {
      throw new Error(`Argument ${index} must be an array of strings.`);
    }
    const parsed = arg.value.map((item, innerIndex) => {
      if (typeof item !== "string") {
        throw new Error(`Argument ${index}[${innerIndex}] must be a string.`);
      }
      return item;
    });
    const data = serialize({ array: { type: "string" } }, parsed);
    return { tag: ARG_TYPE_TAG.ListStr, data };
  }

  throw new Error(`Unknown argument type '${arg.type}' for argument ${index}.`);
}

function serializeCallArg(tag, data) {
  const tagByte = Uint8Array.of(tag);
  const dataVec = serializeVecU8(data);
  return concatBytes([tagByte, dataVec]);
}

function buildEnvelopeBytes(options) {
  const network = serialize("string", options.network);
  const contractId = ensureFixedBytes(options.contractId, 32, "contract_id");
  const func = serialize("string", options.functionName);
  const caller = ensureFixedBytes(options.callerPubkey, 33, "caller_pubkey");

  const callId = options.callIdHex
    ? ensureFixedBytes(options.callIdHex, 16, "call_id")
    : randomBytes16();

  const encodedArgs = options.args.map((arg, idx) => {
    const parsed = parseArg(arg, idx);
    return serializeCallArg(parsed.tag, parsed.data);
  });
  const argsLen = serialize("u32", encodedArgs.length);
  const argsBytes = concatBytes([argsLen, ...encodedArgs]);

  const auth = serializeCallAuth();

  const bytes = concatBytes([
    network,
    contractId,
    func,
    argsBytes,
    caller,
    callId,
    auth,
  ]);

  return {
    callId: bytesToHex(callId),
    bytes,
  };
}

function normalizeNodeUrl(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

export async function buildViewCallPayload(options) {
  const { callId, bytes } = buildEnvelopeBytes(options);
  const payloadBase64 = bytesToBase64(bytes);
  const payloadHex = bytesToHex(bytes);
  const payloadHash = await sha256Hex(bytes);

  const txid = options.txid ?? "";

  return {
    callId,
    payloadHex,
    payloadBase64,
    payloadHash,
    requestBody: {
      txid,
      contract_id: normalizeHex(options.contractId),
      payload: payloadBase64,
    },
  };
}

export async function callViewFunctionDirect(options, logs: boolean = false) {
  const payload = await buildViewCallPayload(options);
  const endpoint = `${normalizeNodeUrl(options.nodeUrl)}contract_call`;

  if (logs) {
    console.log("\n==================================");
    console.log(`[NodeQuery] Request -> ${endpoint}`);
    console.log(`[NodeQuery] Contract: ${options.contractId}`);
    console.log(`[NodeQuery] Function: ${options.functionName}`);
    console.log(`[NodeQuery] Options: ${JSON.stringify(options, null, 2)}`);
    console.log(
      "[NodeQuery] Payload:",
      JSON.stringify(payload.requestBody, null, 2)
    );
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload.requestBody),
  });

  const text = await res.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (logs) {
    console.log(`[NodeQuery] Response Status: ${res.status} ${res.statusText}`);
    console.log("[NodeQuery] Body:", text);
    console.log("==================================\n");
  }

  if (!res.ok) {
    throw new Error(
      `Node call failed (${res.status} ${res.statusText}): ${JSON.stringify(parsed)}`
    );
  }

  return { payload, response: parsed };
}
