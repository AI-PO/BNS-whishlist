"use client";

import { PaperPlaneTilt, Check } from "@phosphor-icons/react/dist/ssr";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { submitWishlist } from "@/app/actions/wishlist";
import { Spinner } from "@/common/components/bn";

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 inline-flex items-center justify-center gap-2 bg-bn-accent text-white font-medium text-[14px] px-6 py-3 rounded-full hover:bg-bn-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-[0_8px_24px_-12px_rgba(247,147,26,0.7)]"
    >
      {pending ? (
        <Spinner size={16} color="currentColor" />
      ) : (
        <>
          Reserve my name
          <PaperPlaneTilt weight="bold" size={14} />
        </>
      )}
    </button>
  );
};

export const WaitlistForm = () => {
  const [state, formAction] = useActionState(submitWishlist, null);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-bn-accent-30 bg-bn-surface/80 backdrop-blur-sm p-8 md:p-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-bn-accent-30 bg-bn-accent-10 text-bn-accent mb-6">
          <Check weight="bold" size={22} />
        </div>
        <h3 className="bn-card-title text-bn-text mb-3">You are on the list.</h3>
        {state.domain ? (
          <p className="text-[14px] text-bn-text-2">
            Your interest in{" "}
            <span className="font-mono-bn text-bn-accent">{state.domain}</span>{" "}
            is noted. We will notify you the moment Bitcoin Names goes live.
          </p>
        ) : (
          <p className="text-[14px] text-bn-text-2">
            You secured priority access to the first drop.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-bn-border bg-bn-surface/80 backdrop-blur-sm p-6 md:p-8"
    >
      {state?.error ? (
        <div className="mb-4 rounded-lg border border-[rgba(204,68,102,0.3)] bg-[rgba(204,68,102,0.08)] text-bn-danger text-[13px] px-4 py-3">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex items-stretch rounded-xl border border-bn-border-mid bg-bn-bg overflow-hidden focus-within:border-bn-accent-30 transition-colors">
          <input
            type="text"
            name="domain"
            placeholder="yourname"
            pattern="[a-zA-Z0-9\-]+"
            className="flex-1 bg-transparent px-4 py-3 text-[15px] text-bn-text placeholder-bn-text-dim focus:outline-none min-w-0"
          />
          <span className="flex items-center font-mono-bn text-[13px] text-bn-text-muted pr-4 select-none">
            .btc
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="Email address"
            className="flex-1 rounded-xl border border-bn-border-mid bg-bn-bg px-4 py-3 text-[15px] text-bn-text placeholder-bn-text-dim focus:outline-none focus:border-bn-accent-30 min-w-0 transition-colors"
          />
          <SubmitButton />
        </div>
      </div>

      <label className="mt-5 flex items-start gap-3 text-[12px] text-bn-text-muted leading-[1.55] cursor-pointer">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 w-4 h-4 shrink-0 accent-bn-accent rounded-sm"
        />
        <span>
          I agree that Bitcoin Names (operated by Dark Fusion Technologies Ltd
          via the Orobit platform) may store my email, and my requested name if
          provided, to notify me when Bitcoin Names launches. My data will not be
          sold or shared. I may withdraw consent by contacting privacy@orobit.ai.
        </span>
      </label>
    </form>
  );
};
