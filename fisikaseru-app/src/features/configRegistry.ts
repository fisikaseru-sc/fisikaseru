import { REFLECTION_QUESTIONS as millikanQuestions, CONSTANTS as millikanConstants, MODULE_TITLE as millikanTitle } from './millikan/config';
import { REFLECTION_QUESTIONS as bandulQuestions, CONSTANTS as bandulConstants, MODULE_TITLE as bandulTitle } from './bandul/config';

export const ConfigRegistry: Record<string, { title: string, questions: { key: string, q: string }[], constants: any }> = {
  millikan: {
    title: millikanTitle,
    questions: millikanQuestions,
    constants: millikanConstants
  },
  bandul: {
    title: bandulTitle,
    questions: bandulQuestions,
    constants: bandulConstants
  }
};
