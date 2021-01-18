// Searches an array of objects according to property(ies)

const {
  massageSelector,
  filterInMemoryFields,
} = require('pouchdb-selector-core');

module.exports = (query, data, limit, offset) => {
  const rows = data.map(item => ({ doc: item }));
  const selector = massageSelector(query);
  const rowsMatched = filterInMemoryFields(rows, { 'selector': selector }, Object.keys(selector));

  const rowsSelected = rowsMatched.slice(offset, offset + limit);
  const answers = rowsSelected.map(row => row.doc);
  return answers;
};
