import Currencies from "@/common/data/currencies.json";

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export type CallbackDefault = () => void;
export type PromiseCallbackDefault = () => Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CallbackWithData<T = any> = (data: T) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObject = Record<string, any>;

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type ValueOf<T> = T[keyof T];

export type PartialNull<T> = { [P in keyof T]: T[P] | null };
export type PartialKeys<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
} & {
  [P in keyof T as P extends K ? P : never]?: T[P];
};

export type KeysOfValue<T, TCondition> = {
  [K in keyof T]: T[K] extends TCondition ? K : never;
}[keyof T];

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type NonNullableValues<T, K extends keyof T> = T & {
  [P in K]: NonNullable<T[P]>;
};

export const ErrorsModal = {
  500: "500",
  404: "404",
  429: "429",
  unexpectedError: "unexpectedError",
} as const;
export type ErrorsModalType = (typeof ErrorsModal)[keyof typeof ErrorsModal];

export type Currency = keyof typeof Currencies;

export const isCurrency = (currency: string): currency is Currency => {
  return currency in Currencies;
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Size {
  export type XXXL = "XXXL";
  export type XXL = "XXL";
  export type XL = "XL";
  export type L = "L";
  export type M = "M";
  export type S = "S";
  export type XS = "XS";
  export type XXS = "XXS";
  export type XXXS = "XXXS";
}
