import { Plugin, WorkspaceLeaf } from "obsidian";
import { DyatelView, VIEW_TYPE_DYATEL } from "./view";
import { DEFAULT_SETTINGS, DyatelSettings, normalizeSettings } from "./settings";
import { Language, LANGUAGES } from "./languages";

export default class DyatelPlugin extends Plugin {
	settings: DyatelSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		this.settings = normalizeSettings(await this.loadData());

		this.registerView(VIEW_TYPE_DYATEL, (leaf: WorkspaceLeaf) => new DyatelView(leaf, this));

		this.addCommand({
			id: "open-dyatel",
			name: "Open dyatel",
			callback: () => {
				void this.activateView();
			},
		});
	}

	currentLanguage(): Language {
		return LANGUAGES.find((language) => language.code === this.settings.language) ?? LANGUAGES[0];
	}

	async setLanguage(code: string): Promise<void> {
		this.settings.language = code;
		await this.saveData(this.settings);
	}

	private async activateView(): Promise<void> {
		const { workspace } = this.app;

		const existing = workspace.getLeavesOfType(VIEW_TYPE_DYATEL);
		if (existing.length > 0) {
			workspace.revealLeaf(existing[0]);
			return;
		}

		const leaf = workspace.getLeaf("tab");
		await leaf.setViewState({ type: VIEW_TYPE_DYATEL, active: true });
		workspace.revealLeaf(leaf);
	}
}
