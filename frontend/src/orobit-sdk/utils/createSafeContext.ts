"use client";

import { createContext, useContext } from "react";

import { tuple } from "./tuple";

export const createSafeContext = <T>(name: string, values: T | null = null) => {
  const context = createContext<T | null>(values);
  const useContextValue = () => {
    const maybeValue = useContext(context);
    if (!maybeValue) {
      throw new Error(
        `No ${name} provider in scope. Provide a ${name} provider in a parent component.`
      );
    }
    return maybeValue;
  };
  return tuple(context, useContextValue);
};
