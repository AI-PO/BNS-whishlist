export type ContractArgType = "str" | "int";

export interface ContractArg {
  type: ContractArgType;
  value: string | number;
}

export function formatContractArgs(args: ContractArg[]): string {
  return JSON.stringify(args);
}
