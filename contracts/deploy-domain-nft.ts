#!/usr/bin/env bun

import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

type WalletInfo = {
  address: string;
  public_key_hex: string;
  network: string;
};

type WalletApi = {
  generate_wallet(instanceName: string, password: string, mnemonic: string): Promise<string>;
  init(instanceName: string, password: string, network: string, esploraUrl: string): Promise<string>;
  sync(): Promise<string>;
  get_public_key(): string | Record<string, unknown>;
  scl_vm_contract_deploy(
    nodeUrl: string,
    bytecodeHex: string,
    abiJson: string,
    functionOffsetsJson: string,
    functionOffsetToLocalsJson: string,
    constantsJson: string,
    feeSats: bigint,
  ): Promise<string>;
  scl_vm_contract_call(
    nodeUrl: string,
    contractId: string,
    functionName: string,
    argsJson: string,
    readOnly: boolean,
    feeSats: bigint,
  ): Promise<string>;
};

type WalletModule = {
  default: () => Promise<unknown>;
  SclWallet: new () => WalletApi;
};

type ContractConfig = {
  bytecodeHex: string;
  abi: unknown;
  function_offsets: Record<string, number>;
  function_offset_to_locals: Record<string, number>;
  constants: unknown[];
};

const currentFilePath = fileURLToPath(import.meta.url);
const contractsDir = path.dirname(currentFilePath);

const env = {
  ...readEnvFile(path.join(contractsDir, '.env.example')),
  ...readEnvFile(path.join(contractsDir, '.env')),
  ...Object.fromEntries(
    Object.entries(process.env).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, value]],
    ),
  ),
};

const walletModuleSpecifier = env.SCL_WALLET_MODULE ?? './pkg/scl_wallet.js';
const nodeUrl = env.SCL_NODE_URL ?? 'https://testscl.darkfusion.tech';
const currencyContractId = env.CURRENCY_CONTRACT_ID;
const dryRun = env.SCL_DRY_RUN === '1';

if (!currencyContractId) {
  throw new Error('Missing CURRENCY_CONTRACT_ID in contracts/.env or contracts/.env.example');
}

const walletConfig = {
  instanceName: env.SCL_WALLET_INSTANCE_NAME ?? 'domain-nft-deployer-wallet',
  password: env.SCL_WALLET_PASSWORD ?? 'changeme123',
  mnemonic:
    env.SCL_WALLET_MNEMONIC ??
    'transfer dragon october enact holiday bid interest favorite tell tape method annual',
  network: env.SCL_NETWORK ?? 'testnet',
  esploraUrl: env.SCL_ESPLORA_URL ?? 'https://testnet.darkfusion.tech',
  feeSats: BigInt(env.SCL_FEE_SATS ?? '200'),
};

const domainConfig = {
  name: env.DOMAIN_NFT_NAME ?? 'Bitcoin Names',
  symbol: env.DOMAIN_NFT_SYMBOL ?? 'BNS',
  uriPrefix: env.DOMAIN_NFT_URI_PREFIX ?? 'https://bitcoinnames.testnet/metadata/',
  pricePerYear: Number(env.DOMAIN_NFT_PRICE_PER_YEAR ?? '10000000'),
};

async function main() {
  const contractConfig = await loadContractConfig('domain_nft');

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          walletModuleSpecifier,
          nodeUrl,
          currencyContractId,
          walletInstanceName: walletConfig.instanceName,
          domainName: domainConfig.name,
          domainSymbol: domainConfig.symbol,
          domainUriPrefix: domainConfig.uriPrefix,
          domainPricePerYear: domainConfig.pricePerYear,
          initOffset: contractConfig.function_offsets.init,
        },
        null,
        2,
      ),
    );
    return;
  }

  const { default: sclWalletInit, SclWallet } = await loadWalletModule(walletModuleSpecifier);

  await sclWalletInit();
  const wallet = new SclWallet();

  const createResult = await wallet.generate_wallet(
    walletConfig.instanceName,
    walletConfig.password,
    walletConfig.mnemonic,
  );
  console.log('generate_wallet:', createResult);

  const initResult = await wallet.init(
    walletConfig.instanceName,
    walletConfig.password,
    walletConfig.network,
    walletConfig.esploraUrl,
  );
  console.log('wallet init:', initResult);

  const syncResult = unwrapResult(await wallet.sync(), 'sync');
  console.log('wallet synced:', JSON.stringify(syncResult));

  const walletInfo = unwrapResult<WalletInfo>(wallet.get_public_key(), 'get_public_key');
  console.log('wallet address:', walletInfo.address);

  const contractId = await deployContract(wallet, 'domain_nft');

  console.log('waiting 1s before init...');
  await wait(1000);

  const initResultPayload = await callWrite(wallet, contractId, 'init', [
    { type: 'str', value: walletInfo.address },
    { type: 'str', value: domainConfig.name },
    { type: 'str', value: domainConfig.symbol },
    { type: 'str', value: domainConfig.uriPrefix },
    { type: 'str', value: currencyContractId },
  ]);

  console.log('domain_nft init result:', JSON.stringify(initResultPayload, null, 2));

  console.log('waiting 1s before set_price...');
  await wait(1000);

  const setPriceResultPayload = await callWrite(wallet, contractId, 'set_price', [
    { type: 'int', value: domainConfig.pricePerYear },
  ]);

  console.log('domain_nft set_price result:', JSON.stringify(setPriceResultPayload, null, 2));
  console.log(
    JSON.stringify(
      {
        contractId,
        owner: walletInfo.address,
        currencyContractId,
        pricePerYear: domainConfig.pricePerYear,
        nodeUrl,
      },
      null,
      2,
    ),
  );
}

function readEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {};
  }

  const content = readFileSync(filePath, 'utf8');
  const entries = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) {
        return null;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      return key ? [key, value] : null;
    })
    .filter((entry): entry is [string, string] => entry !== null);

  return Object.fromEntries(entries);
}

async function loadWalletModule(specifier: string): Promise<WalletModule> {
  try {
    const resolvedSpecifier = resolveImportSpecifier(specifier);
    return (await import(resolvedSpecifier)) as WalletModule;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Could not load wallet module from ${specifier}. Set SCL_WALLET_MODULE if needed. ${message}`,
    );
  }
}

function resolveImportSpecifier(specifier: string): string {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const absolutePath = path.resolve(contractsDir, specifier);
    return pathToFileURL(absolutePath).href;
  }

  return specifier;
}

async function loadContractConfig(filename: string): Promise<ContractConfig> {
  const artifactsDir = path.join(contractsDir, 'artifacts');
  const [metaRaw, abiRaw, hexRaw] = await Promise.all([
    readFile(path.join(artifactsDir, `${filename}.meta.json`), 'utf8'),
    readFile(path.join(artifactsDir, `${filename}.abi.json`), 'utf8'),
    readFile(path.join(artifactsDir, `${filename}.hex`), 'utf8'),
  ]);

  return {
    bytecodeHex: hexRaw.trim(),
    abi: JSON.parse(abiRaw),
    ...JSON.parse(metaRaw),
  } as ContractConfig;
}

async function deployContract(wallet: WalletApi, filename: string): Promise<string> {
  const cfg = await loadContractConfig(filename);
  console.log(`deploying ${filename}...`);

  const result = unwrapResult<{ contract_id?: string }>(
    await wallet.scl_vm_contract_deploy(
      nodeUrl,
      cfg.bytecodeHex,
      JSON.stringify(cfg.abi),
      JSON.stringify(cfg.function_offsets),
      JSON.stringify(cfg.function_offset_to_locals),
      JSON.stringify(cfg.constants),
      walletConfig.feeSats,
    ),
    'scl_vm_contract_deploy',
  );

  if (!result.contract_id) {
    throw new Error('scl_vm_contract_deploy returned no contract_id');
  }

  console.log(`${filename} deployed:`, result.contract_id);
  return result.contract_id;
}

async function callWrite(
  wallet: WalletApi,
  contractId: string,
  functionName: string,
  args: Array<{ type: string; value: string | number }>,
) {
  return unwrapResult(
    await wallet.scl_vm_contract_call(
      nodeUrl,
      contractId,
      functionName,
      JSON.stringify(args),
      false,
      walletConfig.feeSats,
    ),
    `scl_vm_contract_call(${functionName})`,
  );
}

function unwrapResult<T>(raw: string | Record<string, unknown>, label: string): T {
  let parsed: Record<string, unknown>;

  try {
    parsed = typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : raw;
  } catch {
    throw new Error(`${label}: could not parse response: ${String(raw)}`);
  }

  if (parsed.Error) {
    throw new Error(`${label} failed: ${String(parsed.Error)}`);
  }

  return (parsed.Result !== undefined ? parsed.Result : parsed) as T;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});