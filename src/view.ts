import { ItemView, Notice, WorkspaceLeaf, setIcon } from "obsidian";
import type DyatelPlugin from "./main";
import { LANGUAGES } from "./languages";
import { NumberField } from "./numberField";
import { speak, stopSpeech } from "./speech";

export const VIEW_TYPE_DYATEL = "dyatel-view";

const DEFAULT_FROM = 0;
const DEFAULT_TO = 100_000;
const GROUPING_LOCALE = "en-US";

export class DyatelView extends ItemView {
	private readonly plugin: DyatelPlugin;

	private fromField: NumberField;
	private toField: NumberField;
	private languageSelect: HTMLSelectElement;
	private hideToggle: HTMLInputElement;
	private resultEl: HTMLElement;
	private numberEl: HTMLElement;
	private hintEl: HTMLElement;
	private listenButton: HTMLButtonElement;
	private errorEl: HTMLElement;

	private currentValue: number | null = null;
	private revealed = true;

	constructor(leaf: WorkspaceLeaf, plugin: DyatelPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_DYATEL;
	}

	getDisplayText(): string {
		return "Dyatel";
	}

	getIcon(): string {
		return "dices";
	}

	async onOpen(): Promise<void> {
		const container = this.contentEl;
		container.empty();
		container.addClass("dyatel-view");

		const card = container.createDiv({ cls: "dyatel-card" });

		this.buildHeader(card);
		card.createDiv({ cls: "dyatel-divider" });
		this.buildRangeRow(card);
		this.buildOptionsRow(card);

		this.errorEl = card.createDiv({ cls: "dyatel-error" });
		this.errorEl.hide();

		this.buildResult(card);
		this.buildActions(card);

		this.renderResult();
	}

	async onClose(): Promise<void> {
		stopSpeech();
		this.contentEl.empty();
	}

	private buildHeader(parent: HTMLElement): void {
		const header = parent.createDiv({ cls: "dyatel-header" });

		const icon = header.createDiv({ cls: "dyatel-header-icon" });
		setIcon(icon, "dices");

		const text = header.createDiv({ cls: "dyatel-header-text" });
		text.createDiv({ cls: "dyatel-title", text: "Random Number" });
		text.createDiv({ cls: "dyatel-subtitle", text: "Generate and practice listening" });
	}

	private buildRangeRow(parent: HTMLElement): void {
		const row = parent.createDiv({ cls: "dyatel-range" });
		this.fromField = new NumberField(row, "From", DEFAULT_FROM);
		this.toField = new NumberField(row, "To", DEFAULT_TO);
	}

	private buildOptionsRow(parent: HTMLElement): void {
		const row = parent.createDiv({ cls: "dyatel-options" });

		const languageField = row.createDiv({ cls: "dyatel-field" });
		languageField.createEl("label", {
			text: "Language",
			cls: "dyatel-label",
			attr: { for: "dyatel-language" },
		});
		this.languageSelect = languageField.createEl("select", {
			cls: "dropdown dyatel-select",
			attr: { id: "dyatel-language" },
		});
		for (const language of LANGUAGES) {
			this.languageSelect.createEl("option", { text: language.label, value: language.code });
		}
		this.languageSelect.value = this.plugin.settings.language;
		this.languageSelect.addEventListener("change", () => {
			stopSpeech();
			void this.plugin.setLanguage(this.languageSelect.value);
		});

		const toggleWrap = row.createEl("label", { cls: "dyatel-toggle", attr: { for: "dyatel-hide" } });
		this.hideToggle = toggleWrap.createEl("input", {
			cls: "dyatel-checkbox",
			attr: { id: "dyatel-hide", type: "checkbox" },
		});
		toggleWrap.createSpan({ text: "Hide number" });
		this.hideToggle.addEventListener("change", () => {
			this.revealed = !this.hideToggle.checked;
			this.renderResult();
		});
	}

	private buildResult(parent: HTMLElement): void {
		this.resultEl = parent.createDiv({ cls: "dyatel-result" });
		this.numberEl = this.resultEl.createDiv({ cls: "dyatel-number" });
		this.hintEl = this.resultEl.createDiv({ cls: "dyatel-hint", text: "Click to reveal" });

		// The blurred number doubles as the reveal control.
		this.resultEl.addEventListener("click", () => {
			if (this.currentValue === null || this.revealed) return;
			this.revealed = true;
			this.renderResult();
		});
	}

	private buildActions(parent: HTMLElement): void {
		const actions = parent.createDiv({ cls: "dyatel-actions" });

		const generate = actions.createEl("button", {
			cls: "dyatel-button dyatel-button-primary",
			attr: { type: "button" },
		});
		setIcon(generate.createSpan({ cls: "dyatel-button-icon" }), "refresh-cw");
		generate.createSpan({ text: "Generate new" });
		generate.addEventListener("click", () => this.generate());

		this.listenButton = actions.createEl("button", {
			cls: "dyatel-button",
			attr: { type: "button" },
		});
		setIcon(this.listenButton.createSpan({ cls: "dyatel-button-icon" }), "volume-2");
		this.listenButton.createSpan({ text: "Listen" });
		this.listenButton.addEventListener("click", () => void this.listen());
	}

	private generate(): void {
		const from = this.fromField.getValue();
		const to = this.toField.getValue();

		if (Number.isNaN(from) || Number.isNaN(to)) {
			this.showError("Enter whole numbers in both fields.");
			return;
		}
		if (from > to) {
			this.showError('"From" must not be greater than "To".');
			return;
		}

		this.clearError();
		this.currentValue = from + Math.floor(Math.random() * (to - from + 1));
		this.revealed = !this.hideToggle.checked;
		this.renderResult();
	}

	private async listen(): Promise<void> {
		if (this.currentValue === null) {
			new Notice("Generate a number first.");
			return;
		}

		// Google reads a bare numeral as words in the target language, so no
		// per-language spelling table is needed.
		const spoken = String(this.currentValue);
		const language = this.plugin.currentLanguage();

		this.listenButton.disabled = true;
		try {
			const engine = await speak(spoken, language.code, language.label);
			if (engine === "system") {
				new Notice("Google voice unavailable — used the local system voice.");
			}
		} catch (error) {
			new Notice(error instanceof Error ? error.message : String(error));
		} finally {
			this.listenButton.disabled = this.currentValue === null;
		}
	}

	private renderResult(): void {
		const hidden = this.currentValue !== null && !this.revealed;

		this.numberEl.setText(
			this.currentValue === null ? "—" : this.currentValue.toLocaleString(GROUPING_LOCALE),
		);
		this.numberEl.toggleClass("is-blurred", hidden);
		this.resultEl.toggleClass("is-clickable", hidden);
		this.hintEl.toggleClass("is-visible", hidden);
		this.listenButton.disabled = this.currentValue === null;
	}

	private showError(message: string): void {
		this.errorEl.setText(message);
		this.errorEl.show();
		this.currentValue = null;
		this.renderResult();
	}

	private clearError(): void {
		this.errorEl.setText("");
		this.errorEl.hide();
	}
}
