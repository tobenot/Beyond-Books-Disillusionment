// tagManager.js

let tags = {};
let tagsConfig = {};

function loadTagsConfig() {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	fetch(`config/tagsConfig.json?v=${timestamp}`)
		.then((response) => response.json())
		.then((data) => {
			tagsConfig = data;
			tags = tagsConfig;
			window.tagsConfig = tagsConfig;
			window.tags = tags;
			if (Object.keys(tagsConfig).length === 0) {
				console.warn("Warning: Tags config is empty.");
			}
		})
		.catch((error) => {
			console.error("Error loading tags config:", error);
		});
}

function saveTags() {
	localStorage.setItem("tags", JSON.stringify(tags));
}

function findTag(path) {
	const keys = path.split(".");
	let current = tags;
	for (const key of keys) {
		if (!current[key]) {
			current[key] = {};
		}
		current = current[key];
	}
	return current;
}

function updateTag(path, value) {
	const tag = findTag(path);
	if (tag) {
		tag.value = (tag.value || 0) + value;
		saveTags();
		return tag;
	} else {
		console.error(`Tag ${path} not found`);
		return null;
	}
}

function calculateWeight(path) {
	const tag = findTag(path);
	return tag ? tag.value : 0;
}

function getSubTagWeights(path) {
	const tag = findTag(path);
	if (!tag) return 0;

	let total = 0;
	if (typeof tag === "object") {
		for (const key in tag) {
			if (key !== "value") {
				total += calculateWeight(`${path}.${key}`);
			}
		}
	}
	return total;
}

function applyTagModifier() {
	console.log("applyTagModifier", tagsConfig.变化);
	const TagModifierConfig = tagsConfig.变化;

	function traverseAndUpdate(config, path = '') {
		for (const [key, value] of Object.entries(config)) {
		const currentPath = path ? `${path}.${key}` : key;

		if (value && value.value !== undefined) {
			if (value.value !== 0) {
			console.log("updateTag", currentPath, value.value);
			updateTag(currentPath, value.value);
			}
		} else {
			traverseAndUpdate(value, currentPath);
		}
		}
	}

	if (TagModifierConfig) {
		traverseAndUpdate(TagModifierConfig);
	}
}

window.updateTag = updateTag;
window.tags = tags;
window.startup_loadTagsConfig = loadTagsConfig;
window.applyTagModifier = applyTagModifier;