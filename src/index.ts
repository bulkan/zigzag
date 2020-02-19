import p5, { Color } from 'p5';
import palettes from 'nice-color-palettes/100.json';

new p5((p: p5) => {
  let palette = p.random(palettes);
  let background = "white";
  let square;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(background);

    document.onkeydown = function(e) {
      if (e.metaKey && e.keyCode === 83) {
        p.saveCanvas(`zigzag-${Date.now()}`, "png")
        return false;
      }
    }
    square = fitSquares(p.windowWidth - 100, p.windowHeight - 100, 1);
  };

  p.draw = () => {

    p.stroke("black");
    p.strokeWeight(10);

    p.translate(p.windowWidth / 2, p.windowHeight / 2);

    const frameX = -square / 2;
    const frameY = -square / 2;

    // outer rect - frame
    p.rect(frameX, frameY, square, square);

    // inner frame
    const offset = 20;

    p.strokeWeight(5);


    const lineX = frameX + offset;
    
    p.beginShape(p.POINTS);

    // top line
    for (let x = lineX; x < square / 2 - offset; x += 10) {
      p.vertex(x, -square / 2 + offset * 2);
    }
    
    // p.vertex(x, y);
    // p.vertex(x + square, y);
    // p.vertex(x, y + square);
    // p.vertex(x + square, y + square);

    p.endShape();
    p.noLoop();
  };
});


function fitSquares(width: number, height: number, n) {
  let sx, sy = 0;

  const px = Math.ceil(Math.sqrt((n * width) / height));

  if (Math.floor((px * height) / width) * px < n) {
    sx = height / Math.ceil((px * height) / width);
  } else {
    sx = width / px;
  }

  const py = Math.ceil(Math.sqrt((n * height) / width));

  if (Math.floor((py * width) / height) * py < n) {
    sy = width / Math.ceil((width * py) / height);
  } else {
    sy = height / py;
  }

  return Math.max(sx, sy);
}