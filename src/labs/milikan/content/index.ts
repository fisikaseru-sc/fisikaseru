import Step1 from "@/labs/milikan/content/step1.mdx";
import Step2 from "@/labs/milikan/content/step2.mdx";
import Step4 from "@/labs/milikan/content/step4.mdx";
import Step5 from "@/labs/milikan/content/step5.mdx";

const stepContent = {
  1: Step1,
  2: Step2,
  4: Step4,
  5: Step5,
} as const;

export function getMilikanMdxStep(step: number) {
  return stepContent[step as keyof typeof stepContent] ?? null;
}
