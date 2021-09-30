import { Hex } from '../dist'
import { mostInfluence } from './hexGrid';

declare const SVG: any

const A_OFFSET = 64;
const qrFromDigDig = (l, d) => {
  return { q: 'a'.toLowerCase().charCodeAt(0) - 97 + l, r: d};
}

const qrFromLettDig = (l, d) =>
  qrFromDigDig(l.toLowerCase().charCodeAt(0) - A_OFFSET, d);

const lettDigFromQR = (q, r)  => {
  return [String.fromCharCode(q + A_OFFSET), r];
};

const draw = SVG().addTo('body').size('100%', '100%')

function cellDescription(hex: Hex, turn) {
  if (hex.owner) {
    if (hex.owner.claimed) {
      return `${hex.owner.claimed}`
    } else if (hex.owner.owned) {
      return `${hex.owner.owned}5`
    }
    console.log(`cDesc   Why here?  ${hex.owner}`);
  } else if (hex.influence) {
    let most = mostInfluence(hex, turn);
    if (most[0] === '**') {
      return `${most[0]}`;
    }
    if (!most[0]) {
      // console.log(`D  ${hex}  ${most[0]}  ${most[1]}`)
      let ld = lettDigFromQR(hex.q, hex.r);
      return `${ld[0]} ${ld[1]}`;
    }

    return `${most[0]}${most[1]}`;
  } else {
    let ld = lettDigFromQR(hex.q, hex.r);
    return `${ld[0]} ${ld[1]}`;
  }
}

function weight(hex, turn) {
  if (hex.owner) {
    if (hex.owner.claimed) {
      return .5;
    } else {
     return .40;
    }
  } else if (hex.influence) {
    let most = mostInfluence(hex, turn);
    return Math.min(.45,
     Math.max(.3, ((most[1] * .02) + .28)));
  } else {
    return .25;
  }
}

export const render = (hex: Hex, turn) => {
  const OFFSET_X = 200;
  const OFFSET_Y = 20;
  const polygon = draw
    .polygon(hex.corners.map(({ x, y }) => `${x- OFFSET_X},${y-OFFSET_Y}`))
    .fill('#ccddcc')
    .stroke({ width: 1, color: '#999' });

  const text = draw
    .text(cellDescription(hex, turn))
    .font({
      size: hex.width * weight(hex, turn),
      anchor: 'middle',
      'dominant-baseline': 'central',
      leading: 0,
      fill: '#69c'
    })
    .translate(hex.x -OFFSET_X, hex.y - OFFSET_Y)

  return draw.group().add(polygon).add(text)
}
