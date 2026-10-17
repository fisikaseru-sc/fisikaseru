import { REFLECTION_QUESTIONS as millikanQuestions, CONSTANTS as millikanConstants, MODULE_TITLE as millikanTitle } from './millikan/config';
import { REFLECTION_QUESTIONS as bandulQuestions, CONSTANTS as bandulConstants, MODULE_TITLE as bandulTitle } from './bandul/config';
import { PARABOLA_CONFIG } from './parabola/config';

export const ConfigRegistry: Record<string, { title: string, questions: { key: string, q: string }[], constants: Record<string, number | string> }> = {
  millikan: {
    title: millikanTitle,
    questions: millikanQuestions,
    constants: millikanConstants
  },
  bandul: {
    title: bandulTitle,
    questions: bandulQuestions,
    constants: bandulConstants
  },
  parabola: {
    title: PARABOLA_CONFIG.meta.title,
    questions: PARABOLA_CONFIG.reflectionQuestions,
    constants: PARABOLA_CONFIG.constants
  }
};
