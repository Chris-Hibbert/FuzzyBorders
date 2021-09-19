import {Grid, rectangle, spiral} from '../dist'

// Q: +3..-3  corresponds to A..G
// R: -3..+3  corresponds to 1..7
const A_OFFSET = 97;
const qrFromLettDig = (l, d) => [l.toLowerCase().charCodeAt(0) - A_OFFSET + 1, d]
const qrFromDigDig = (l, d) => ['a'.toLowerCase().charCodeAt(0) - A_OFFSET + l, d];
const lettDigFromQR = (q, r)  => [String.fromCharCode(q + A_OFFSET), r];

function traverseSpiral(grid, c, size, fn) {
  return grid.update(
    mutating => {
      const fn2 = fn(mutating);
      const hexes =  mutating.traverse(spiral({start: c, radius: size }))
        .each(fn2)
        .run();
    }
  )
}

function buildGrid(size, hexProto) {
  console.log(`building Grid ${size}`);

  let GRID_CENTER = qrFromDigDig(size, size);
  console.log(GRID_CENTER);
  const tempGrid = new Grid(hexProto, rectangle({ height: 4 * size, width: 4 * size, start: [-size, -size ] }));
  const center = tempGrid.getHex(GRID_CENTER)

  function removeFarHexes(mut) {
    return hex => {
      let distance = tempGrid.distance(center, hex);
      if (distance > size - 1) {
        mut.store.delete(`${hex.q},${hex.r}`)
      }
    }
  }
  return traverseSpiral(tempGrid, GRID_CENTER, size * 5, removeFarHexes);
}

function influenceList(hex, turn) {
  return hex.influence && hex.influence[turn];
}

function setInfluenceList(hex, turn, newInfluence) {
  if (!hex.influence) {
    hex.influence = {[turn]:newInfluence};
    // console.log(
    //   `SET: ${hex}   ${Object.getOwnPropertyNames(hex.influence[turn])}`);
    return;
  }
  hex.influence[turn] = newInfluence;

  // console.log(`pushed  `, hex.influence[turn]);
}

function mostInfluence(hex, turn) {
  let max = 0;
  let influencers = [];

  const list = influenceList(hex, turn);
  // console.log(`INF   ${Object.getOwnPropertyNames(list)}`);

  if (list) {
     Object.getOwnPropertyNames(list).forEach((name) => {
     // console.log(`${name}  ${list[name]}`);
       const power = list[name];
        if (power > max) {
          max = power;
          influencers = [name];
        } else if (power === max) {
          influencers.push(name);
        }
      }, {});
  }
  // console.log(`MOST  ${influencers}, ${max}`);
  if (influencers.length > 1) {
    // console.log(`hex ${hex} size ${influencers.length}`, influencers);
    return ['**', max];
  }

  return [influencers[0], max];
}

function influence(grid, c, size, turn) {

  function spreadInfluence(mut) {
    return ownedHex => {
      function addInfluence(m) {
        return influencedHex => {
          const list = influenceList(influencedHex, turn) || {};
          let playerInfluence = list[player] || 0;

          playerInfluence += 5 - grid.distance(influencedHex, ownedHex);
          list[player] = playerInfluence;
          setInfluenceList(influencedHex, turn, list);
          mut.store.set(`${influencedHex.q},${influencedHex.r}`, influencedHex);
        }
      }

      const player = ownedHex.owner;
      if (player) {
        console.log(`${ownedHex} owned by ${player}`);
        traverseSpiral(grid, ownedHex, 4, addInfluence);
      }
    }
  }
console.log(`OWNERSHIP  ${c}, ${size}`)

  traverseSpiral(grid, c, size, spreadInfluence);
}

export { buildGrid, qrFromLettDig, qrFromDigDig, lettDigFromQR, influence, mostInfluence };
