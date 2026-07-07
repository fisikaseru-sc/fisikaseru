"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { createAttemptId } from "@/lib/session/session-store";

interface StartAttemptButtonProps {
  label?: string;
  className?: string;
}

export function StartAttemptButton({ label = "Mulai Attempt", className }: StartAttemptButtonProps) {
  const router = useRouter();

  return (
    <Button
      className={className}
      onClick={() => {
        const attemptId = createAttemptId();
        router.push(`/app/attempt/${attemptId}/step/1`);
      }}
    >
      {label}
    </Button>
  );
}
