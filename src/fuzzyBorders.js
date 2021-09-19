const { buildGrid, qrFromLettDig } = require('./hexGrid.js');
const { hexPrototype, renderHex } = require('./render.js');

const grid = buildGrid(10, hexPrototype);

console.log(`rendering..  ${grid}`);

grid.each(hex => renderHex(hex));

console.log(' rendered');

module.exports = grid;
