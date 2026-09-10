export interface Language {
	code: string;
	label: string;
}

/** Languages supported by the Google Translate voice, in menu order. */
export const LANGUAGES: Language[] = [
	{ code: "pt-BR", label: "Portuguese (Brazil)" },
	{ code: "pt-PT", label: "Portuguese (Portugal)" },
	{ code: "en-US", label: "English (US)" },
	{ code: "en-GB", label: "English (UK)" },
	{ code: "es", label: "Spanish" },
	{ code: "fr", label: "French" },
	{ code: "de", label: "German" },
	{ code: "it", label: "Italian" },
	{ code: "nl", label: "Dutch" },
	{ code: "pl", label: "Polish" },
	{ code: "ru", label: "Russian" },
	{ code: "tr", label: "Turkish" },
	{ code: "ja", label: "Japanese" },
	{ code: "ko", label: "Korean" },
	{ code: "zh-CN", label: "Chinese (Mandarin)" },
];

export const DEFAULT_LANGUAGE = "pt-BR";

export function isSupportedLanguage(code: string): boolean {
	return LANGUAGES.some((language) => language.code === code);
}
