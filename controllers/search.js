// Searches an array of objects according to property(ies)

const objectDoesMatch = require("./objectDoesMatch");

module.exports = (query, data, limit, offset) => {
  const answers = [];
  for (let i = 0; i < data.length && answers.length < limit + offset; i++) {
    if (objectDoesMatch(query, data[i])) {
      answers.push(data[i]);
    }
  }

  return answers.slice(offset);
};
