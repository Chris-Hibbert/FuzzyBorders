const { createHexPrototype, Grid, rectangle } = require('honeycomb-grid');
const SVG = require('@svgdotjs/svg.js');

const Z = 175;
// const draw = SVG(document.body)
// const Hex = Honeycomb.extendHex(

const hexProto = {
  size: 20,
  offset: 0,						// default: -1
  owner: undefined,

  render(draw) {
    const position = this.toPoint()
    const centerPosition = this.center().add(position)

    this.draw = draw

    // draw the hex
    this.draw
      .polygon(this.corners().map(({ x, y }) => `${x},${y}`))
      .fill('none')
      .stroke({ width: 1, color: '#999' })
      .translate(position.x+Z, position.y+Z)

    const fontSize = 12

    // draw x and y coordinates
    this.draw
      .text(`${this.x},${this.y}, rq: [${this.r}, ${this.q}]`)
      .font({
        size: fontSize,
        anchor: 'middle',
        leading: 1.4,
        fill: '#69c'
      })
      .translate(centerPosition.x+Z, centerPosition.y +Z - fontSize)
  }
};

const hexPrototype = createHexPrototype(hexProto);

// new Grid(hexPrototype, hexagon({radius: 3}))
//   .each(render)
//   .run();

function renderHex(hex) {
  hex.render(draw)
}

module.exports = { renderHex, hexPrototype };
