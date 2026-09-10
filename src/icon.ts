export const WOODPECKER_ICON_ID = "dyatel-woodpecker";

/**
 * A cartoon woodpecker mid-peck. Registered through Obsidian's addIcon, so the
 * markup is the inner content of a 0 0 100 100 viewBox.
 */
export const WOODPECKER_ICON_SVG = `
<g stroke="none">
	<rect x="2" y="3" width="16" height="94" rx="5" fill="#8a5a3b"/>
	<path d="M9 20 h6 M9 47 h5 M9 74 h6" stroke="#6f462d" stroke-width="3" stroke-linecap="round"/>
	<path d="M13 26 l5 4 M13 51 l5 -4" stroke="#f7ede2" stroke-width="3" stroke-linecap="round"/>
	<path d="M80 60 L99 71 L78 79 Z" fill="#3d4759"/>
	<path d="M50 76 L27 83" stroke="#f2a03d" stroke-width="6" stroke-linecap="round"/>
	<path d="M27 83 l-7 -4 M27 83 l-6 6" stroke="#f2a03d" stroke-width="5" stroke-linecap="round"/>
	<ellipse cx="61" cy="57" rx="23" ry="20" fill="#4f5d75"/>
	<ellipse cx="55" cy="65" rx="12" ry="11" fill="#f7ede2"/>
	<ellipse cx="71" cy="53" rx="10" ry="13" fill="#3d4759" transform="rotate(20 71 53)"/>
	<path d="M66 47 l7 5 M63 55 l8 5" stroke="#5b6980" stroke-width="2.5" stroke-linecap="round"/>
	<path d="M38 24 L44 6 L47 20 L55 5 L56 19 L64 9 L60 26 Z" fill="#e63946"/>
	<circle cx="46" cy="37" r="17" fill="#4f5d75"/>
	<ellipse cx="39" cy="45" rx="7" ry="5.5" fill="#f7ede2"/>
	<path d="M31 30 L12 37 L31 44 Z" fill="#f2a03d"/>
	<path d="M31 37 L18 37" stroke="#d4832a" stroke-width="2" stroke-linecap="round"/>
	<circle cx="47" cy="32" r="6" fill="#f7ede2"/>
	<circle cx="48" cy="32" r="2.8" fill="#22252e"/>
	<circle cx="49.4" cy="30.6" r="1" fill="#ffffff"/>
</g>
`.trim();
