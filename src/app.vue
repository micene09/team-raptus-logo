<template>
<div class="page">
	<div id="title" class="title-bar">
		<h3 class="title">Team Raptus Logo Lab</h3>
		<span class="tools">
			<ThemeSwitch />
			<GitHubRepo :href="repoUrl" class="contrast" />
		</span>
	</div>
	<div class="form" id="form">
		<ColorPicker label="Background" v-model="bgColor" />
		<ColorPicker label="Primary" v-model="primary" />
		<fieldset role="group">
			<button class="outline" @click="onClickImport">Import</button>
			<button class="outline" @click="onClickExport">Export</button>
			<button class="outline" @click="onClickRandomColors">Random</button>
			<button :data-tooltip="copiedTooltip" @click="share">Share</button>
		</fieldset>
		<fieldset role="group">
			<FormatPicker label="&nbsp;" v-model="format" />
			<button @click="download">Save</button>
		</fieldset>
		<ResolutionPicker v-model:w="width" v-model:h="height" :disabled="format === 'SVG'" />
		<div class="grid">
			<label class="just-button">
				&nbsp;
			</label>
		</div>
		<div class="save-area">
			<label>
				&nbsp;
			</label>
			<label>
				&nbsp;
			</label>
		</div>
	</div>
	<div class="logo-wrapper" id="preview" :style="{ background: bgColor }" :aria-busy="loadingDebounced">
		<template v-if="!loadingDebounced">
			<Logo class="logo"
				:bgColor="bgColor"
				:primary="primary"
			/>
		</template>
	</div>
</div>
<div class="print-area" ref="printArea" :style="{
		background: bgColor,
		width: width + 'px',
		height: height + 'px'
	}">
	<Logo class="logo"
		:bgColor="bgColor"
		:primary="primary"
	/>
</div>
</template>
<script lang="ts" src="./app.ts" />
