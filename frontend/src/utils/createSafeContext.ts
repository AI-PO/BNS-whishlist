"use client";

import { createContext, useContext } from "react";

import { tuple } from "./tuple";

/**
 * Build a strongly typed tuple
 *
 * Returning a tuple from a function will discard
 * the type information of the individual items,
 * returning (A | b)[] instead of [A, B].
 *
 * This function maintains that type information.
 *
 * @param values
 */

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
