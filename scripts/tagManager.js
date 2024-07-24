// tagManager.js
let tags = {};

function loadTags() {
  const storedTags = localStorage.getItem('tags');
  if (storedTags) {
    tags = JSON.parse(storedTags);
  } else {
    tags = {};
  }
  console.log('loadTags tags = ',tags);
}

function saveTags() {
  localStorage.setItem('tags', JSON.stringify(tags));
}

function findTag(path) {
    const keys = path.split('.');
    let current = tags;
    for (const key of keys) {
      if (!current[key]) {
        current[key] = {};  // 如果找不到当前键，则创建一个新的对象
        current[key].value = 0;
      }
      current = current[key];
    }
    return current;
  }
  

function updateTag(path, value) {
  const tag = findTag(path);
  console.log('updateTag:', path, value);
  if (tag) {
    tag.value += value;
    saveTags();
    console.log('saveTags:', path, tag.value);
  } else {
    console.error(`Tag ${path} not found`);
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

loadTags();

export { tags, findTag, updateTag, calculateWeight, getSubTagWeights };

window.updateTag = updateTag;
window.tags = tags;