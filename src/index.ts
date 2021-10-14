import { createHexPrototype, Grid, Hex, spiral, rectangle } from '../dist'
import { createSuite } from './benchmark'
import { render } from './render'
import {buildGrid, qrFromLettDig, influence, reportScores} from './hexGrid';

interface CustomHex extends Hex {
  [prop: string]: any
}

console.log(rectangle);

const hexPrototype = createHexPrototype<CustomHex>({
  dimensions: 21, // CONTROLS size of hexes in grid
  orientation: 'pointy',
  custom: 'custom',
  origin: 'topLeft',
})

const qrFromDigDig = (l, d) => {
    return { q: 'a'.toLowerCase().charCodeAt(0) - 97 + l, r: d};
}

let GRID_CENTER = qrFromDigDig(10,10);
const SIZE = 30;

const grid = new Grid(hexPrototype,
  rectangle({ start: [0, 0], width: SIZE, height: SIZE }))

grid.update(
  mutating => {
    const hexes = mutating.traverse(
          spiral({start: GRID_CENTER, radius: SIZE * 5 }))
      .each(hex => {
        let distance = grid.distance(GRID_CENTER, hex);
        if (distance > SIZE - 1) {
          mutating.store.delete(hex.toString());
        }
      })
    .run();
  }
);

const claimHex = (grid, hex, owner, turn) =>{
  grid.update(mutating => {
    let mutableHex = mutating.getHex(hex);
    mutableHex.owner = { claimed: owner, turn};
    mutating.store.set(hex, mutableHex);
  });
};

let turn = 1;
const gridNew = buildGrid(10, hexPrototype);
// updateOwner(gridNew,[6,9], 'CH');
// updateOwner(gridNew,qrFromLettDig('d',13), 'CH');
// updateOwner(gridNew,qrFromLettDig('k',4), 'TH');
// updateOwner(gridNew,qrFromLettDig('o',10), 'TH');


//   Rules diagrams
claimHex(gridNew,qrFromLettDig('i',9), 'AL', turn);
claimHex(gridNew,qrFromLettDig('j',13), 'AT', turn);
influence(gridNew, GRID_CENTER, 20, turn)
console.log(reportScores(gridNew, GRID_CENTER, 20, turn));
console.log(`    set T1 owners`)
turn += 1;

claimHex(gridNew,qrFromLettDig('k',10), 'AL', turn);
claimHex(gridNew,qrFromLettDig('o',6), 'AT', turn);
influence(gridNew, GRID_CENTER, 20, turn)
console.log(reportScores(gridNew, GRID_CENTER, 20, turn));
console.log(`    set T2 owners`)

gridNew.each(hex => {
  hex.svg = render(hex, turn)
}).run();
console.log(gridNew.store)

createSuite().add('', function () {
  /* */
})
