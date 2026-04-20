import type { FacelessVoiceOption } from "../types";

const fallbackVoiceIds = [
  "af_alloy",
  "af_aoede",
  "af_bella",
  "af_heart",
  "af_jessica",
  "af_kore",
  "af_nicole",
  "af_nova",
  "af_river",
  "af_sarah",
  "af_sky",
  "am_adam",
  "am_echo",
  "am_eric",
  "am_fenrir",
  "am_liam",
  "am_michael",
  "am_onyx",
  "am_puck",
  "am_santa",
  "bf_alice",
  "bf_emma",
  "bf_isabella",
  "bf_lily",
  "bm_daniel",
  "bm_fable",
  "bm_george",
  "bm_lewis",
  "ef_dora",
  "em_alex",
  "em_santa",
  "ff_siwis",
  "hf_alpha",
  "hf_beta",
  "hm_omega",
  "hm_psi",
  "if_sara",
  "im_nicola",
  "jf_alpha",
  "jf_gongitsune",
  "jf_nezumi",
  "jf_tebukuro",
  "jm_kumo",
  "pf_dora",
  "pm_alex",
  "pm_santa",
  "zf_xiaobei",
  "zf_xiaoni",
  "zf_xiaoxiao",
  "zf_xiaoyi",
  "zm_yunjian",
  "zm_yunxi",
  "zm_yunxia",
  "zm_yunyang"
] as const;

function toLabel(voice: string) {
  const [, name = voice] = voice.split("_", 2);
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toGender(voice: string) {
  return voice[1] === "f" ? "Female" : "Male";
}

function toLanguage(voice: string) {
  const langCode = voice[0];
  return {
    a: "American English",
    b: "British English",
    e: "Spanish",
    f: "French",
    h: "Hindi",
    i: "Italian",
    j: "Japanese",
    p: "Brazilian Portuguese",
    z: "Mandarin Chinese"
  }[langCode] ?? "American English";
}

function toSampleText(voice: string) {
  const langCode = voice[0];
  return {
    a: "In the last few months, this faceless channel has exploded.",
    b: "In the last few months, this faceless channel has exploded.",
    e: "En los ultimos meses, este canal sin rostro ha crecido muchisimo.",
    f: "Ces derniers mois, cette chaine sans visage a vraiment explose.",
    h: "Pichhle kuchh mahino mein, yeh faceless channel bahut tezi se bada hai.",
    i: "Negli ultimi mesi, questo canale senza volto e cresciuto tantissimo.",
    j: "Kono suukagetsu de, kono faceless channel wa kyukoushou shimashita.",
    p: "Nos ultimos meses, este canal sem rosto cresceu muito rapido.",
    z: "Zai guoqu ji ge yue li, zhe ge wulian pindao kuaisu baohong le."
  }[langCode] ?? "In the last few months, this faceless channel has exploded.";
}

export const fallbackFacelessVoices: FacelessVoiceOption[] = fallbackVoiceIds.map((voice) => ({
  voice,
  label: toLabel(voice),
  language: toLanguage(voice),
  gender: toGender(voice),
  quality_grade: null,
  sample_text: toSampleText(voice)
}));
