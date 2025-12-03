import { ref, defineComponent, onMounted, useTemplateRef } from "vue";
import { toPng, toSvg } from 'html-to-image';
import ColorScheme from "./color-scheme";
import Logo from "./components/logo.vue"
import ColorPicker from "./components/color-picker.vue";
import FormatPicker from "./components/format-picker.vue";
import ResolutionPicker from "./components/resolution-picker.vue";
import ThemeSwitch from "./components/theme-switch.vue";
import GitHubRepo from "./components/github-repo.vue";
import { refAutoReset, refDebounced, useClipboard, useDark } from "@vueuse/core";

export type Preset = {
	bgColor: string
	primary: string
}
export default defineComponent({
	components: {
		Logo,
		ColorPicker,
		FormatPicker,
		ResolutionPicker,
		ThemeSwitch,
		GitHubRepo
	},
	setup() {
		const { copy } = useClipboard()
		const loading = ref(true)
		const loadingDebounced = refDebounced(loading, 300)
		const copiedTooltip = refAutoReset<string | undefined>(undefined, 2500)
		const printArea = useTemplateRef<HTMLDivElement>("printArea")
		const isDark = useDark({
			selector: "html",
			attribute: "data-theme",
			valueDark: 'dark',
			valueLight: 'light'
		})
		const primary = ref(isDark.value ? "#ffffff" : "#000000")
		const bgColor = ref("transparent")
		const format = ref<"PNG" | "SVG">("PNG")
		const width = ref(760);
		const height = ref(1000);
		const repoUrl = ref("https://github.com/micene09/team-raptus-logo")
		function getPresetObject(): Preset {
			return {
				primary: primary.value,
				bgColor: bgColor.value
			}
		}
		async function download() {
			const style = { position: "static" };
			const dataUrl = format.value === "PNG"
				? await toPng(printArea.value!, { width: width.value, height: height.value, style })
				: await toSvg(printArea.value!)
			const link = document.createElement('a')
			link.download = 'team-raptus-logo.' + format.value.toLowerCase()
			link.href = dataUrl
			link.click()
		}
		function share() {
			const preset = getPresetObject()
			const searchParams = new URLSearchParams(preset)
			const url = new URL(location.href.split("?")[0] + "?" + searchParams.toString())
			copy(url.toString())
			copiedTooltip.value = "Link copied"
		}
		async function onClickImport() {
			const [handle] = await window.showOpenFilePicker({
					multiple: false,
					types: [{
						description: "Team Raptus Logo Preset",
						accept: { 'application/*': ['.json'] }
					}]
			})
			if (handle.kind !== "file") return
			const file = await handle.getFile()
			const reader = new FileReader()
			reader.readAsText(file)
			reader.onload = function(){
				const content = reader.result as string
				try {
					const preset: Preset = JSON.parse(content)
					primary.value = preset.primary
					bgColor.value = preset.bgColor
				} catch {}
			}
		}
		function onClickExport() {
			const exportObj = getPresetObject()
			const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, undefined, "  "))
			const anchor = document.createElement('a')
			anchor.setAttribute("href", dataStr)
			anchor.setAttribute("download", "team-raptus-logo.json")
			document.body.appendChild(anchor)
			anchor.click()
			anchor.remove()
		}
		function onClickRandomColors() {
			const colors = new ColorScheme()
				.from_hue(Math.random() * 10000)
				.scheme('contrast')
				.variation('default')
				.colors()
			primary.value = "#" + colors.at(0)
			bgColor.value = "#" + colors.at(-1)
		}
		function onThemeChange(theme: "dark" | "light") {
			if (primary.value === "#ffffff" && theme === "light")
				primary.value = "#000000"
			if (primary.value === "#000000" && theme === "dark")
				primary.value = "#ffffff"
		}

		onMounted(() => {
			const url = new URL(location.href)
			if (!url.search) return loading.value = false
			const params = url.searchParams
			const queryStringPreset: Partial<Preset> = {
				bgColor: params.get("bgColor") ?? "",
				primary: params.get("primary") ?? ""
			}
			bgColor.value = queryStringPreset.bgColor ?? "transparent";
			primary.value = queryStringPreset.primary ?? "transparent";
			if (primary.value === "transparent") onClickRandomColors();
			loading.value = false
		})

		return {
			loading,
			loadingDebounced,
			onClickRandomColors,
			repoUrl,
			printArea,
			bgColor,
			primary,
			format,
			width,
			height,
			share,
			copiedTooltip,
			download,
			onClickImport,
			onClickExport,
			onThemeChange
		}
	}
})
