import { DEFAULT_LANGUAGE, isSupportedLanguage } from "./languages";

export interface DyatelSettings {
	language: string;
}

export const DEFAULT_SETTINGS: DyatelSettings = {
	language: DEFAULT_LANGUAGE,
};

export function normalizeSettings(raw: unknown): DyatelSettings {
	const data = (raw ?? {}) as Partial<DyatelSettings>;
	const language =
		typeof data.language === "string" && isSupportedLanguage(data.language)
			? data.language
			: DEFAULT_LANGUAGE;
	return { language };
}
