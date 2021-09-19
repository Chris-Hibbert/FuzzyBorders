const { createHexPrototype, Grid, rectangle, spiral } = require('honeycomb-grid');

// Q: +3..-3  corresponds to A..G
// R: -3..+3  corresponds to 1..7
const A_OFFSET =97;
const qrFromLettDig = (l, d) => [l.toLowerCase().charCodeAt(0) - A_OFFSET, d]
const qrFromDigDig = (l, d) => ['a'.toLowerCase().charCodeAt(0) - A_OFFSET + l, d];
const lettDigFromQR = (q, r)  => [String.fromCharCode(q + A_OFFSET), r];

function buildGrid(size, hexProto) {
  let GRID_CENTER = qrFromDigDig(size, size);
  const tempGrid = new Grid(hexProto, rectangle({ height: 4 * size, width: 4 * size, start: [-size, -size ] }));
  const center = tempGrid.getHex(GRID_CENTER)

  return tempGrid.update(
    mutating => {
      const hexes =  mutating.traverse(spiral({start: GRID_CENTER, radius: size * 5 }))
        .each(hex => {
          let distance = tempGrid.distance(center, hex);
          // console.log(`${hex}, ${distance}`);
          if (distance > size - 1) {
            mutating.store.delete(hex.toString());
          }
        })
        .run();
    }
  )
}

module.exports = { buildGrid, qrFromLettDig, qrFromDigDig, lettDigFromQR };
