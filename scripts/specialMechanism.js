const placeholderHandlers = {
	tagValue: (path) => getValue(path),
	otherType: (path) => handleOtherType(path),
};

function replacePlaceholders(template) {
	return template.replace(/\{\{(.*?)\}\}/g, (_, placeholder) => {
		const [type, path] = placeholder.split(":");
		const handler = placeholderHandlers[type];
		return handler ? handler(path) : `{{${placeholder}}}`;
	});
}

function getValue(path) {
	const keys = path.split(".");
	let current = window.tags;
	for (const key of keys) {
		if (!current[key]) return 0;
		current = current[key];
	}
	return current.value || 0;
}

function examTest(value, maxScore) {

}

window.specialMechanism.replacePlaceholders = replacePlaceholders();