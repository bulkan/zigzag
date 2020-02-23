import p5 from "p5";
import palettes from "nice-color-palettes";
import dt from "delaunay-triangulate";

new p5((p: p5) => {
  let palette = p.random(palettes);
  let background = "white";
  let square;

  let points: Array<p5.Vector>;
  let triangles: Array<Array<number>>;

  const offset = 100;
  const MAX_POINTS = 100;

  let colorIndex = 0;

  const trigArea = (a, b, c) => Math.abs((a.x * (b.y - c.y)) + (b.x * (c.y - a.y)) + (c.x * (a.y - b.y)) / 2);

  function drawInnerLines(a, b, c) {
    const area = trigArea(a, b, c);
    
    const nbLines = 5; //p.floor(p.map(area, 0, 20000, 1, 5, true));
    // const strokeWeight = p.floor(p.map(area, 0, 20000, 0, 5, true));
    
    // p.strokeWeight(strokeWeight);

    for (let i = 0; i < nbLines; i++) {
      let xa = p.map(i, 0, nbLines, a.x, c.x);
      let ya = p.map(i, 0, nbLines, a.y, c.y);
      let xb = p.map(i, 0, nbLines, b.x, c.x);
      let yb = p.map(i, 0, nbLines, b.y, c.y);

      p.line(xa, ya, xb, yb);
    }
  }

  p.mousePressed = () => p.redraw();

  p.setup = () => {
    p.pixelDensity(window.devicePixelRatio || 1);
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(background);

    document.onkeydown = function(e) {
      if (e.metaKey && e.keyCode === 83) {
        p.saveCanvas(`zigzag-${Date.now()}`, "png");
        return false;
      }
    };

    square = fitSquares(p.windowWidth - offset, p.windowHeight - offset, 1);

    points = Array.from(new Array(MAX_POINTS)).map(() => p.createVector(
      p.random(square),
      p.random(square)
    ));

    points = [
      p.createVector(0, 0),
      p.createVector(0, square),
      p.createVector(square, 0),
      p.createVector(square, square),
      ...points
    ]

    triangles = dt(points.map(p => [p.x, p.y]));
    p.noLoop();
  };

  p.draw = () => {

    const frameThickness = 5;

    p.stroke("black");
    p.strokeWeight(frameThickness);

    p.translate(p.windowWidth / 2, p.windowHeight / 2);

    const frameX = -square / 2;
    const frameY = -square / 2;

    // outer rect - frame
    p.rect(frameX, frameY, square, square);

    p.translate(frameX, frameY);

    p.stroke("black");
    p.strokeWeight(6);
    
    for (let i = 0; i < triangles.length; i++) {
      const cell = triangles[i];

      // p.fill(palette[colorIndex]);
      p.beginShape(p.TRIANGLE_STRIP);

      for (let j = 0; j < cell.length; j++) {
        const pnt = points[cell[j]];
        p.vertex(pnt.x, pnt.y);
      }

      p.vertex(points[cell[0]][0], points[cell[0]][1]);
      p.endShape();

      // colorIndex = (colorIndex + palette.length - 1) % palette.length;
      colorIndex = p.floor(p.random(0, palette.length - 1));

      const [a, b, c] = (cell.map(i => points[i]));

      drawInnerLines(a, b, c);
    }
  };
});

function fitSquares(width: number, height: number, n) {
  let sx,
    sy = 0;

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