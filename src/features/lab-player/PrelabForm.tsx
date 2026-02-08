"use client";

import { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/Button";
import { LabAttemptSession } from "@/lib/session/types";

interface PrelabFormProps {
  session: LabAttemptSession;
  setSession: Dispatch<SetStateAction<LabAttemptSession | null>>;
}

interface Question {
  key: keyof LabAttemptSession["prelab"];
  label: string;
  placeholder: string;
}

const QUESTIONS: Question[] = [
  {
    key: "variables",
    label: "1) Tuliskan semua variabel terkait Milikan",
    placeholder: "Contoh: U, d, eta, rho_oil, rho_air, t1, t2, v1, v2, r0, q0, P, T",
  },
  {
    key: "variableRoles",
    label: "2) Identifikasi variabel bebas/terikat/kontrol",
    placeholder: "Jelaskan variabel bebas, variabel terikat, dan kontrol",
  },
  {
    key: "changingVariables",
    label: "3) Variabel apa yang diubah dan berubah dalam praktikum",
    placeholder: "Contoh: U diubah, t1/t2 berubah",
  },
  {
    key: "hypothesis",
    label: "4) Hipotesis hubungan antar variabel",
    placeholder: "Tuliskan hipotesis kuantitatif/konseptual",
  },
  {
    key: "collectedData",
    label: "5) Data apa yang dikumpulkan",
    placeholder: "Contoh: U, t1, t2, mark, q0, qc",
  },
  {
    key: "tableDesign",
    label: "6) Desain tabel pengamatan",
    placeholder: "Kolom data mentah + data turunan",
  },
];

export function PrelabForm({ session, setSession }: PrelabFormProps) {
  const answers = session.prelab;

  const complete = QUESTIONS.every((question) => {
    const value = answers[question.key];
    return typeof value === "string" && value.trim().length > 5;
  });

  return (
    <div className="panel space-y-3 p-4">
      {QUESTIONS.map((question) => (
        <label key={question.key} className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">{question.label}</span>
          <textarea
            className="h-20 w-full rounded-lg border border-slate-300 p-2"
            placeholder={question.placeholder}
            value={(answers[question.key] as string) ?? ""}
            onChange={(event) =>
              setSession((prev) =>
                prev
                  ? {
                      ...prev,
                      prelab: {
                        ...prev.prelab,
                        [question.key]: event.target.value,
                      },
                    }
                  : prev,
              )
            }
          />
        </label>
      ))}

      <div className="flex items-center gap-2">
        <Button
          onClick={() =>
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    prelab: {
                      ...prev.prelab,
                      completed: complete,
                    },
                    currentStep: Math.max(prev.currentStep, complete ? 2 : prev.currentStep),
                  }
                : prev,
            )
          }
        >
          Simpan Pre-lab
        </Button>
        <span className="text-sm text-slate-500">
          Status: {session.prelab.completed ? "lengkap" : "belum lengkap"}
        </span>
      </div>
    </div>
  );
}
