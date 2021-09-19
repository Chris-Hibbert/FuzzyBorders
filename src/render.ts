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

function cellDescription(hex: Hex) {
  if (hex.owner) {
    return `${hex.owner}`
  } else if (hex.influence) {
    let most = mostInfluence(hex, 1);
    if (most[0] === '**') {
      return `${most[0]}`;
    }
    return `${most[0]}${most[1]}`;
  } else {
    let ld = lettDigFromQR(hex.q, hex.r);
    return `${ld[0]} ${ld[1]}`;
  }
}

function weight(hex) {
  if (hex.owner) {
    return .5;
  } else if (hex.influence) {
    let most = mostInfluence(hex, 1);
    return Math.min(.45,
     Math.max(.3, ((most[1] * .02) + .28)));
  } else {
    return .25;
  }
}

export const render = (hex: Hex) => {
  const OFFSET_X = 200;
  const OFFSET_Y = 20;
  const polygon = draw
    .polygon(hex.corners.map(({ x, y }) => `${x- OFFSET_X},${y-OFFSET_Y}`))
    .fill('#ccddcc')
    .stroke({ width: 1, color: '#999' });

  const text = draw
    .text(cellDescription(hex))
    .font({
      size: hex.width * weight(hex),
      anchor: 'middle',
      'dominant-baseline': 'central',
      leading: 0,
      fill: '#69c'
    })
    .translate(hex.x -OFFSET_X, hex.y - OFFSET_Y)

  return draw.group().add(polygon).add(text)
}
