import { setIcon } from "obsidian";

const GROUPING_LOCALE = "en-US";

/**
 * A text field that shows grouped digits ("100,000") with its own stepper,
 * since a native number input cannot render thousands separators.
 */
export class NumberField {
	readonly input: HTMLInputElement;

	constructor(parent: HTMLElement, label: string, initial: number) {
		const id = `dyatel-${label.toLowerCase()}`;

		const field = parent.createDiv({ cls: "dyatel-field" });
		field.createEl("label", { text: label, cls: "dyatel-label", attr: { for: id } });

		const control = field.createDiv({ cls: "dyatel-control" });
		this.input = control.createEl("input", {
			cls: "dyatel-input",
			attr: { id, type: "text", inputmode: "numeric", autocomplete: "off", spellcheck: "false" },
		});

		const stepper = control.createDiv({ cls: "dyatel-stepper" });
		this.createStepButton(stepper, "chevron-up", 1, `Increase ${label}`);
		this.createStepButton(stepper, "chevron-down", -1, `Decrease ${label}`);

		// Free-form while typing, regrouped once the field loses focus.
		this.input.addEventListener("blur", () => this.format());

		this.setValue(initial);
	}

	getValue(): number {
		const cleaned = this.input.value.replace(/[^\d-]/g, "");
		const parsed = Number.parseInt(cleaned, 10);
		return Number.isNaN(parsed) ? Number.NaN : parsed;
	}

	setValue(value: number): void {
		this.input.value = value.toLocaleString(GROUPING_LOCALE);
	}

	private format(): void {
		const value = this.getValue();
		if (!Number.isNaN(value)) this.setValue(value);
	}

	private createStepButton(parent: HTMLElement, icon: string, delta: number, label: string): void {
		const button = parent.createEl("button", {
			cls: "dyatel-step",
			attr: { type: "button", "aria-label": label },
		});
		setIcon(button, icon);
		button.addEventListener("click", () => {
			const current = this.getValue();
			this.setValue((Number.isNaN(current) ? 0 : current) + delta);
			this.input.dispatchEvent(new Event("change"));
		});
	}
}
