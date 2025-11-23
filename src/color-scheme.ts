/**
 * Interfacce per le strutture dati statiche
 */
interface IPresets {
	[key: string]: number[];
}

interface IColorWheel {
	[key: number]: number[];
}

interface IRGB {
	red: number;
	green: number;
	blue: number;
	value: number;
}

/**
 * Classe MutableColor
 * Gestisce la logica del singolo colore all'interno dello schema.
 * Originariamente definita come ColorScheme.mutablecolor.
 */
export class MutableColor {
	private hue: number = 0;
	private saturation: number[] = [];
	private value: number[] = [];
	private base_red: number = 0;
	private base_green: number = 0;
	private base_blue: number = 0;
	private base_saturation: number = 0;
	private base_value: number = 0;

	constructor(hue: number) {
		if (hue == null) {
			throw new Error("No hue specified");
		}
		this.set_hue(hue);
		this.set_variant_preset(ColorScheme.PRESETS['default']);
	}

	public get_hue(): number {
		return this.hue;
	}

	public set_hue(h: number): void {
		const avrg = (a: number, b: number, k: number) => a + Math.round((b - a) * k);

		this.hue = Math.round(h % 360);

		const d = this.hue % 15 + (this.hue - Math.floor(this.hue));
		const k = d / 15;

		let derivative1 = this.hue - Math.floor(d);
		let derivative2 = (derivative1 + 15) % 360;

		if (derivative1 === 360) derivative1 = 0;
		if (derivative2 === 360) derivative2 = 0;

		const colorset1 = ColorScheme.COLOR_WHEEL[derivative1];
		const colorset2 = ColorScheme.COLOR_WHEEL[derivative2];

		const en: { [key: string]: number } = { red: 0, green: 1, blue: 2, value: 3 };

		for (const color of Object.keys(en)) {
			const i = en[color];
			// Dynamic access to base_red, base_green, etc.
			(this as any)[`base_${color}`] = avrg(colorset1[i], colorset2[i], k);
		}

		this.base_saturation = avrg(100, 100, k) / 100;
		this.base_value /= 100;
	}

	public rotate(angle: number): void {
		const newhue = (this.hue + angle) % 360;
		this.set_hue(newhue);
	}

	public get_saturation(variation: number): number {
		const x = this.saturation[variation];
		let s = x < 0 ? -x * this.base_saturation : x;
		if (s > 1) s = 1;
		if (s < 0) s = 0;
		return s;
	}

	public get_value(variation: number): number {
		const x = this.value[variation];
		let v = x < 0 ? -x * this.base_value : x;
		if (v > 1) v = 1;
		if (v < 0) v = 0;
		return v;
	}

	public set_variant(variation: number, s: number, v: number): number {
		this.saturation[variation] = s;
		this.value[variation] = v;
		return v;
	}

	public set_variant_preset(p: number[]): void {
		for (let i = 0; i <= 3; i++) {
			this.set_variant(i, p[2 * i], p[2 * i + 1]);
		}
	}

	public get_hex(web_safe: boolean, variation: number): string {
		const colorNames = ['red', 'green', 'blue'];

		const max = Math.max(...colorNames.map(c => (this as any)[`base_${c}`] as number));
		// min is calculated in original code but unused? Maintaining logic just in case,
		// although strict cleanup would remove it.
		// const min = Math.min(...colorNames.map(c => (this as any)[`base_${c}`] as number));

		const v = (variation < 0 ? this.base_value : this.get_value(variation)) * 255;
		const s = variation < 0 ? this.base_saturation : this.get_saturation(variation);
		const k = max > 0 ? v / max : 0;

		let rgb: number[] = [];

		for (const color of colorNames) {
			const baseColor = (this as any)[`base_${color}`] as number;
			const rgbVal = Math.min(255, Math.round(v - (v - baseColor * k) * s));
			rgb.push(rgbVal);
		}

		if (web_safe) {
			rgb = rgb.map(c => Math.round(c / 51) * 51);
		}

		let formatted = "";
		for (const i of rgb) {
			let str = i.toString(16);
			if (str.length < 2) {
				str = "0" + str;
			}
			formatted += str;
		}

		return formatted;
	}
}

/**
 * Classe ColorScheme
 * Main entry point per la generazione di schemi colori.
 */
export class ColorScheme {
	public static readonly SCHEMES: { [key: string]: boolean } = {};

	public static readonly PRESETS: IPresets = {
		"default": [-1, -1, 1, -0.7, 0.25, 1, 0.5, 1],
		pastel: [0.5, -0.9, 0.5, 0.5, 0.1, 0.9, 0.75, 0.75],
		soft: [0.3, -0.8, 0.3, 0.5, 0.1, 0.9, 0.5, 0.75],
		light: [0.25, 1, 0.5, 0.75, 0.1, 1, 0.5, 1],
		hard: [1, -1, 1, -0.6, 0.1, 1, 0.6, 1],
		pale: [0.1, -0.85, 0.1, 0.5, 0.1, 1, 0.1, 0.75]
	};

	public static readonly COLOR_WHEEL: IColorWheel = {
		0: [255, 0, 0, 100],
		15: [255, 51, 0, 100],
		30: [255, 102, 0, 100],
		45: [255, 128, 0, 100],
		60: [255, 153, 0, 100],
		75: [255, 178, 0, 100],
		90: [255, 204, 0, 100],
		105: [255, 229, 0, 100],
		120: [255, 255, 0, 100],
		135: [204, 255, 0, 100],
		150: [153, 255, 0, 100],
		165: [51, 255, 0, 100],
		180: [0, 204, 0, 80],
		195: [0, 178, 102, 70],
		210: [0, 153, 153, 60],
		225: [0, 102, 178, 70],
		240: [0, 51, 204, 80],
		255: [25, 25, 178, 70],
		270: [51, 0, 153, 60],
		285: [64, 0, 153, 60],
		300: [102, 0, 153, 60],
		315: [153, 0, 153, 60],
		330: [204, 0, 153, 80],
		345: [229, 0, 102, 90]
	};

	// Mantiene compatibilità con l'accesso statico legacy
	public static mutablecolor = MutableColor;

	// Inizializzazione statica dei schemes
	static {
		const schemes = "mono monochromatic contrast triade tetrade analogic".split(/\s+/);
		for (const word of schemes) {
			ColorScheme.SCHEMES[word] = true;
		}
	}

	private col: MutableColor[];
	private _scheme: string;
	private _distance: number;
	private _web_safe: boolean;
	private _add_complement: boolean;

	constructor() {
		this.col = [];
		for (let m = 1; m <= 4; m++) {
			this.col.push(new MutableColor(60));
		}
		this._scheme = 'mono';
		this._distance = 0.5;
		this._web_safe = false;
		this._add_complement = false;
	}

	/**
	 * Generates the color hex codes.
	 */
	public colors(): string[] {
		let used_colors = 1;
		const h = this.col[0].get_hue();

		// Dispatch logic using arrow functions to preserve 'this' context cleanly
		const dispatch: { [key: string]: () => void } = {
			mono: () => { /* No operation */ },
			contrast: () => {
				used_colors = 2;
				this.col[1].set_hue(h);
				this.col[1].rotate(180);
			},
			triade: () => {
				used_colors = 3;
				const dif = 60 * this._distance;
				this.col[1].set_hue(h);
				this.col[1].rotate(180 - dif);
				this.col[2].set_hue(h);
				this.col[2].rotate(180 + dif);
			},
			tetrade: () => {
				used_colors = 4;
				const dif = 90 * this._distance;
				this.col[1].set_hue(h);
				this.col[1].rotate(180);
				this.col[2].set_hue(h);
				this.col[2].rotate(180 + dif);
				this.col[3].set_hue(h);
				this.col[3].rotate(dif);
			},
			analogic: () => {
				used_colors = this._add_complement ? 4 : 3;
				const dif = 60 * this._distance;
				this.col[1].set_hue(h);
				this.col[1].rotate(dif);
				this.col[2].set_hue(h);
				this.col[2].rotate(360 - dif);
				this.col[3].set_hue(h);
				this.col[3].rotate(180);
			}
		};

		// Alias
		dispatch['monochromatic'] = dispatch['mono'];

		if (dispatch[this._scheme]) {
			dispatch[this._scheme]();
		} else {
			throw new Error(`Unknown color scheme name: ${this._scheme}`);
		}

		const output: string[] = [];
		for (let i = 0; i < used_colors; i++) {
			for (let j = 0; j < 4; j++) {
				output[i * 4 + j] = this.col[i].get_hex(this._web_safe, j);
			}
		}
		return output;
	}

	/**
	 * Returns colors grouped in sets of 4.
	 */
	public colorset(): string[][] {
		const flat_colors = [...this.colors()]; // Simple array clone
		const grouped_colors: string[][] = [];
		while (flat_colors.length > 0) {
			grouped_colors.push(flat_colors.splice(0, 4));
		}
		return grouped_colors;
	}

	public from_hue(h: number): this {
		if (h == null) {
			throw new Error("from_hue needs an argument");
		}
		this.col[0].set_hue(h);
		return this;
	}

	// Helper to normalize arguments for rgb conversion methods
	private normalizeRgbArgs(args: any[]): [number, number, number] {
		let rgb: number[] = [];
		if (args.length > 0 && Array.isArray(args[0])) {
			rgb = args[0];
		} else {
			rgb = args as number[];
		}
		return [rgb[0], rgb[1], rgb[2]];
	}

	public rgb2ryb(...args: (number | number[])[]): number[] {
		let [red, green, blue] = this.normalizeRgbArgs(args);

		const white = Math.min(red, green, blue);
		red -= white;
		green -= white;
		blue -= white;

		const maxgreen = Math.max(red, green, blue);
		let yellow = Math.min(red, green);
		red -= yellow;
		green -= yellow;

		if (blue > 0 && green > 0) {
			blue /= 2;
			green /= 2;
		}

		yellow += green;
		blue += green;

		const maxyellow = Math.max(red, yellow, blue);
		if (maxyellow > 0) {
			const iN = maxgreen / maxyellow;
			red *= iN;
			yellow *= iN;
			blue *= iN;
		}

		red += white;
		yellow += white;
		blue += white;

		return [Math.floor(red), Math.floor(yellow), Math.floor(blue)];
	}

	public rgb2hsv(...args: (number | number[])[]): number[] {
		let [r, g, b] = this.normalizeRgbArgs(args);

		r /= 255;
		g /= 255;
		b /= 255;

		const min = Math.min(r, g, b);
		const max = Math.max(r, g, b);
		const d = max - min;
		const v = max;
		let s: number;

		if (d > 0) {
			s = d / max;
		} else {
			return [0, 0, v];
		}

		let h = (r === max ? (g - b) / d : (g === max ? 2 + (b - r) / d : 4 + (r - g) / d));
		h *= 60;
		h %= 360;

		return [h, s, v];
	}

	public rgbToHsv(...args: (number | number[])[]): number[] {
		let [r, g, b] = this.normalizeRgbArgs(args);

		r /= 255;
		g /= 255;
		b /= 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h: number = 0;
		const v = max;
		const d = max - min;
		const s = max === 0 ? 0 : d / max;

		if (max === min) {
			h = 0;
		} else {
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}

		return [h, s, v];
	}

	public from_hex(hex: string): this {
		if (hex == null) {
			throw new Error("from_hex needs an argument");
		}
		if (!/^([0-9A-F]{2}){3}$/im.test(hex)) {
			throw new Error(`from_hex(${hex}) - argument must be in the form of RRGGBB`);
		}

		const rgbcap = /(..)(..)(..)/.exec(hex)!.slice(1, 4);
		const [r, g, b] = rgbcap.map(num => parseInt(num, 16));

		const [rybR, rybG, rybB] = this.rgb2ryb(r, g, b);
		const hsv = this.rgbToHsv(rybR, rybG, rybB);

		const h = hsv[0];
		const s = hsv[1];
		const v = hsv[2];

		this.from_hue(h * 360);
		this._set_variant_preset([s, v, s, v * 0.7, s * 0.25, 1, s * 0.5, 1]);

		return this;
	}

	public add_complement(b: boolean): this {
		if (b == null) throw new Error("add_complement needs an argument");
		this._add_complement = b;
		return this;
	}

	public web_safe(b: boolean): this {
		if (b == null) throw new Error("web_safe needs an argument");
		this._web_safe = b;
		return this;
	}

	public distance(d: number): this {
		if (d == null) throw new Error("distance needs an argument");
		if (d < 0) throw new Error(`distance(${d}) - argument must be >= 0`);
		if (d > 1) throw new Error(`distance(${d}) - argument must be <= 1`);
		this._distance = d;
		return this;
	}

	// Overload signatures
	public scheme(): string;
	public scheme(name: string): this;
	public scheme(name?: string): string | this {
		if (name == null) {
			return this._scheme;
		} else {
			if (ColorScheme.SCHEMES[name] == null) {
				throw new Error(`'${name}' isn't a valid scheme name`);
			}
			this._scheme = name;
			return this;
		}
	}

	public variation(v: string): this {
		if (v == null) {
			throw new Error("variation needs an argument");
		}
		if (ColorScheme.PRESETS[v] == null) {
			throw new Error(`'${v}' isn't a valid variation name`);
		}
		this._set_variant_preset(ColorScheme.PRESETS[v]);
		return this;
	}

	private _set_variant_preset(p: number[]): void {
		for (let i = 0; i <= 3; i++) {
			this.col[i].set_variant_preset(p);
		}
	}
}

export default ColorScheme;
