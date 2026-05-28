"use client";

import { PageError } from "@/shared/feedback";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GateLogsError({ error, reset }: ErrorProps) {
  return <PageError error={error} reset={reset} />;
}
