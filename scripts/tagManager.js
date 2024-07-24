// tagManager.js

let tags = {};
let tagsConfig = {};

function loadTagsConfig() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fetch(`config/tagsConfig.json?v=${timestamp}`)
    .then(response => response.json())
    .then(data => {
      tagsConfig = data;
      tags = tagsConfig;
      window.tagsConfig = tagsConfig;
      window.tags = tags;
      if (Object.keys(tagsConfig).length === 0) {
        console.warn('Warning: Tags config is empty.');
      }
    })
    .catch(error => {
      console.error('Error loading tags config:', error);
    });
}

function loadTags() {
  /*const storedTags = localStorage.getItem('tags');
  if (storedTags) {
    tags = JSON.parse(storedTags);
  } else {
    tags = {};
  }*/
}

function saveTags() {
  localStorage.setItem('tags', JSON.stringify(tags));
}

function findTag(path) {
  const keys = path.split('.');
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
  if (typeof tag === 'object') {
    for (const key in tag) {
      if (key !== 'value') {
        total += calculateWeight(`${path}.${key}`);
      }
    }
  }
  return total;
}

loadTagsConfig();
loadTags();

export { tags, tagsConfig, findTag, updateTag, calculateWeight, getSubTagWeights };

window.updateTag = updateTag;
window.tags = tags;