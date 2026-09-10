import { requestUrl } from "obsidian";

const GOOGLE_TTS_URL = "https://translate.google.com/translate_tts";
const GOOGLE_TTS_MAX_CHARS = 200;
const USER_AGENT =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;

export type SpeechEngine = "google" | "system";

function releaseAudio(): void {
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.src = "";
		currentAudio = null;
	}
	if (currentObjectUrl) {
		URL.revokeObjectURL(currentObjectUrl);
		currentObjectUrl = null;
	}
}

export function stopSpeech(): void {
	releaseAudio();
	if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/**
 * Google Translate's TTS endpoint. Higher quality than the local system voices,
 * but it is undocumented, needs a network connection, and caps at ~200 characters.
 * Obsidian's requestUrl is used so the request is not subject to browser CORS.
 */
async function fetchGoogleAudio(text: string, lang: string): Promise<ArrayBuffer> {
	if (text.length > GOOGLE_TTS_MAX_CHARS) {
		throw new Error("Text is too long for the Google voice.");
	}

	const url =
		`${GOOGLE_TTS_URL}?ie=UTF-8&client=tw-ob&ttsspeed=1` +
		`&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`;

	const response = await requestUrl({
		url,
		method: "GET",
		headers: { "User-Agent": USER_AGENT, Referer: "https://translate.google.com/" },
		throw: false,
	});

	if (response.status !== 200) {
		throw new Error(`Google voice returned HTTP ${response.status}.`);
	}
	if (!response.arrayBuffer || response.arrayBuffer.byteLength === 0) {
		throw new Error("Google voice returned no audio.");
	}

	return response.arrayBuffer;
}

async function speakWithGoogle(text: string, lang: string): Promise<void> {
	const buffer = await fetchGoogleAudio(text, lang);

	stopSpeech();

	const objectUrl = URL.createObjectURL(new Blob([buffer], { type: "audio/mpeg" }));
	const audio = new Audio(objectUrl);

	currentAudio = audio;
	currentObjectUrl = objectUrl;

	audio.addEventListener("ended", () => {
		if (currentAudio === audio) releaseAudio();
	});

	try {
		await audio.play();
	} catch (error) {
		releaseAudio();
		throw error;
	}
}

function scoreVoice(voice: SpeechSynthesisVoice, lang: string): number {
	const voiceLang = voice.lang.replace("_", "-").toLowerCase();
	const wanted = lang.toLowerCase();
	const base = wanted.split("-")[0];

	let score = 0;
	if (voiceLang === wanted) score += 10;
	else if (voiceLang.split("-")[0] === base) score += 5;
	else return -1;

	if (/google/i.test(voice.name)) score += 4;
	if (!voice.localService) score += 1;
	return score;
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
	let best: SpeechSynthesisVoice | null = null;
	let bestScore = 0;
	for (const voice of voices) {
		const score = scoreVoice(voice, lang);
		if (score > bestScore) {
			best = voice;
			bestScore = score;
		}
	}
	return best;
}

/** Voice lists load asynchronously in Chromium, so the first call can see an empty list. */
function loadVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
	const voices = synth.getVoices();
	if (voices.length > 0) return Promise.resolve(voices);

	return new Promise((resolve) => {
		const timeout = window.setTimeout(() => {
			synth.removeEventListener("voiceschanged", onChange);
			resolve(synth.getVoices());
		}, 1000);

		const onChange = () => {
			window.clearTimeout(timeout);
			synth.removeEventListener("voiceschanged", onChange);
			resolve(synth.getVoices());
		};

		synth.addEventListener("voiceschanged", onChange);
	});
}

async function speakWithSystem(text: string, lang: string, languageLabel: string): Promise<void> {
	if (!("speechSynthesis" in window)) {
		throw new Error("Speech synthesis is not available here.");
	}

	const synth = window.speechSynthesis;
	const voice = pickVoice(await loadVoices(synth), lang);

	if (!voice) {
		throw new Error(
			`No ${languageLabel} voice is installed — add one in System Settings \u203A Accessibility \u203A Spoken Content.`,
		);
	}

	stopSpeech();

	const utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = lang;
	utterance.rate = 0.9;
	utterance.voice = voice;
	synth.speak(utterance);
}

/**
 * Speaks with the Google voice, falling back to a local system voice when it is
 * unreachable (offline, rate limited). Resolves with the engine that actually spoke.
 */
export async function speak(text: string, lang: string, languageLabel: string): Promise<SpeechEngine> {
	try {
		await speakWithGoogle(text, lang);
		return "google";
	} catch (googleError) {
		try {
			await speakWithSystem(text, lang, languageLabel);
			return "system";
		} catch {
			throw googleError;
		}
	}
}
