export interface FacelessVoiceOption {
  voice: string;
  label: string;
  language: string;
  gender: string;
  quality_grade?: string | null;
  sample_text: string;
}
