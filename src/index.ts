import p5 from "p5";
import palettes from "nice-color-palettes";
import dt from "delaunay-triangulate";

new p5((p: p5) => {
  let palette = p.random(palettes);
  let background = "white";
  let square;

  let points: Array<Array<number>>;
  let triangles: Array<Array<number>>;

  const offset = 100;
  const MAX_POINTS = 26;

  let colorIndex = 0;

  p.mousePressed = () => p.redraw();

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(background);

    document.onkeydown = function(e) {
      if (e.metaKey && e.keyCode === 83) {
        p.saveCanvas(`zigzag-${Date.now()}`, "png");
        return false;
      }
    };

    square = fitSquares(p.windowWidth - offset, p.windowHeight - offset, 1);

    points = Array.from(new Array(MAX_POINTS)).map(() => [
      p.random(square),
      p.random(square)
    ]);

    points = [
      [0, 0],
      [0, square],
      [square, 0],
      [square, square],
      ...points
    ]

    triangles = dt(points);
    p.noLoop();
  };

  p.draw = () => {

    const frameThickness = 10;

    p.stroke("black");
    p.strokeWeight(frameThickness);

    p.translate(p.windowWidth / 2, p.windowHeight / 2);

    const frameX = -square / 2;
    const frameY = -square / 2;

    // outer rect - frame
    p.rect(frameX, frameY, square, square);

    p.translate(frameX, frameY);

    p.stroke("black");
    p.strokeWeight(5);

    p.fill(palette[colorIndex]);
    
    for (let i = 0; i < triangles.length; i++) {
      const cell = triangles[i];

      p.fill(palette[colorIndex]);
      p.beginShape(p.TRIANGLES);

      for (let j = 0; j < cell.length; j++) {
        const [x, y] = points[cell[j]];
        p.vertex(x, y);
      }

      p.vertex(points[cell[0]][0], points[cell[0]][1]);
      p.endShape();
      colorIndex = (colorIndex + palette.length - 1) % palette.length;
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