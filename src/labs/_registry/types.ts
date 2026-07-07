export interface LabStepMeta {
  step: number;
  type: string;
  title: string;
  contentPath?: string;
  sim?: Record<string, string>;
  [key: string]: unknown;
}

export interface LabRegistryItem {
  labId: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  heroPoster: string;
  steps: LabStepMeta[];
}
