// Compares an object to another

module.exports = (query, obj) => {
  let match = true;
  for (let key in query) {
    if (obj[key] !== query[key]) {
      match = false;
      break;
    }
  }
  return match;
};
