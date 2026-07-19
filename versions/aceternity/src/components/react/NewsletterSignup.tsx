"use client";
import { useRef } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Button as StatefulButton } from "@/components/ui/stateful-button";

export default function NewsletterSignup({
  placeholders,
  emailLabel,
  submitLabel,
  buttonLabel,
}: {
  placeholders: string[];
  emailLabel: string;
  submitLabel: string;
  buttonLabel: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fakeSubscribe = () =>
    new Promise<void>((resolve) => {
      wrapperRef.current?.querySelector("form")?.requestSubmit();
      setTimeout(resolve, 1200);
    });

  return (
    <div
      ref={wrapperRef}
      className="flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row sm:items-center"
    >
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        inputLabel={emailLabel}
        submitLabel={submitLabel}
      />
      <StatefulButton
        onClick={fakeSubscribe}
        className="shrink-0 self-start sm:self-auto"
      >
        {buttonLabel}
      </StatefulButton>
    </div>
  );
}
