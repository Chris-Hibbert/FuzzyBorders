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

// mostInfluence is returning a variety of info. Return it in a format that's
// actionable by both cellDesc() and weight()


function mostInfluence(hex, turn) {
  let max = 0;
  let influencers = [];

  const list = influenceList(hex, turn);

  if (list) {
     Object.getOwnPropertyNames(list).forEach(name => {
     // console.log(`${hex}:   ${name}  ${list[name]}  T${turn}`);
       const power = list[name];
        if (power > max) {
          max = power;
          influencers = [name];
        } else if (power === max) {
          influencers.push(name);
        }
      }, {});
  }

  // influencers is now a list of influence wts.
  // influencers[max] is a list of names in the highest category

  // pay attention to previous ownership

  // if () {
  //   return { owner: '' };
  // } else if () {
  //   return { unowned: max };
  // } else
  // const score =
  // console.log(`MOST  ${influencers}, ${max}`);

  if (influencers.length === 0) {
   return [];
  } else if (influencers.length === 1) {
    // console.log(` 1  ${influencers}   Level = ${max}`);
    if (max >= 5) {
      hex.owner = { owned: influencers[0], turn };
      return [influencers[0], 5];
    }
    return [influencers[0], max];
  } else if (influencers.length > 1) {
    // console.log(`  ${hex}  >1  ${influencers}`);
    return ['**', max];
  }

console.log(`MI  ret ${influencers}, ${max}`)
  return [influencers[0], max];
}

function influence(grid, c, size, turn) {

  function spreadInfluence(mut) {
    return ownedHex => {
      if (!ownedHex.owner) {
        return;
      }
      const {claimed, turn: claimedTurn} = ownedHex.owner;
      // TODO: does claimed turn matter, or are we always looking at the latest data

      function addInfluence(m) {
        return influencedHex => {
          const list = influenceList(influencedHex, turn) || {};
          let playerInfluence = list[claimed] || 0;

          playerInfluence += 5 - grid.distance(influencedHex, ownedHex);
          list[claimed] = playerInfluence;
          setInfluenceList(influencedHex, turn, list);
          mut.store.set(`${influencedHex.q},${influencedHex.r}`, influencedHex);
        }
      }

      if (claimed) {
        console.log(`${ownedHex} claimed by ${claimed}`);
        traverseSpiral(grid, ownedHex, 4, addInfluence);
      }
    }
  }
console.log(`OWNERSHIP  ${c}, ${size}`)

  traverseSpiral(grid, c, size, spreadInfluence);
}

export { buildGrid, qrFromLettDig, qrFromDigDig, lettDigFromQR, influence, mostInfluence };
