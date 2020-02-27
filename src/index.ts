import p5, { Vector } from "p5";
import palettes from "nice-color-palettes";
import dt from "delaunay-triangulate";
import { areaOfTrig } from "./util";

new p5((p: p5) => {
  let palette = p.random(palettes);
  let background = "white";
  let square;
  let areaOfSquare;
  let cornerPoints;

  let points: Array<Vector>;
  let triangles: Array<Array<number>>;

  const offset = 100;
  const MAX_POINTS = 10;

  function getAngles(triangle) {    
    const [A, B, C] = triangle;

    const ab = p5.Vector.sub(B, A);  
    const ac = p5.Vector.sub(C, A);
    const angleA = p.degrees(p.acos(ab.dot(ac) / (ab.mag() * ac.mag())));
    // print(angleA.toFixed(1));
    
    const ba = p5.Vector.sub(B, A);
    const bc = p5.Vector.sub(B, C);
    const angleB = p.degrees(p.acos(ba.dot(bc) / (ba.mag() * bc.mag())));
    // print(angleB.toFixed(1));
    
    const angleC = (180 - angleA - angleB);
    
    return [angleA, angleB, angleC];
  }

  function drawLines(innerLineCount, triangle) {
    const [a, b, c] = triangle;

    for (let i = 0; i < innerLineCount; i++) {
      let xa = p.map(i, 0, innerLineCount, a.x, c.x);
      let ya = p.map(i, 0, innerLineCount, a.y, c.y);
      let xb = p.map(i, 0, innerLineCount, b.x, c.x);
      let yb = p.map(i, 0, innerLineCount, b.y, c.y);

      p.line(xa, ya, xb, yb);
    }
  }
  
  function drawInnerLines(triangle) {
    const [a, b, c] = triangle;
    const area = areaOfTrig(a, b, c);

    const angles = getAngles(triangle);
    const twoAnglesSame = (new Set(angles.map(a => p.floor(a)))).size !== angles.length;
    const isSkinnyTriangle = angles.some(ang => ang < 7);
    
    const maxLines = isSkinnyTriangle ? 1 : 100;
    // const maxStroke = isSkinnyTriangle ? 1 : 5;

    let innerLineCount = p.floor(p.map(p.log(area * 0.001 + 1), 0, 12, 0, maxLines, true));
    let strokeWeight = p.floor(p.map(p.log(area * 0.001 + 1), 0, 12, 5, 1, true));

    
    p.strokeWeight(strokeWeight);
    
    if (!twoAnglesSame) {
      drawLines(innerLineCount, triangle);
    } else {
      drawLines(innerLineCount, [c, b, a]); // horizontal
    }

    //   drawLines(...([c, a, b])); // left
  
    return area;
  }

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

    areaOfSquare = square * square;

    points = Array.from(new Array(MAX_POINTS)).map(() => p.createVector(
      p.floor(p.random(square)),
      p.floor(p.random(square))
    ));

    cornerPoints = [
      p.createVector(0, 0),
      p.createVector(square, 0),
      p.createVector(0, square),
      p.createVector(square, square)
    ]

    points = p.shuffle([
      ...cornerPoints,
      // p.createVector(square / 2, 100),
      // p.createVector(10, 200),
      // p.createVector(square - 10, 200),
      ...points
    ]);

    triangles = dt(points.map(p => [p.x, p.y]));
    console.log('sq', areaOfSquare / 2 );
    p.noLoop();
  };

  p.draw = () => {
    p.noFill();
    const frameThickness = 10;

    p.stroke("black");
    p.strokeWeight(frameThickness);

    p.translate(p.windowWidth / 2, p.windowHeight / 2);

    const frameX = -square / 2;
    const frameY = -square / 2;

    // outer rect - frame
    p.rect(frameX - 20, frameY - 20, square + 40, square + 40);

    // inner rect - frame
    p.rect(frameX, frameY, square, square);
  
    p.translate(frameX, frameY);

    p.stroke("black");
    p.strokeWeight(5);

    let areas = [];
    
    for (let i = 0; i < triangles.length; i++) {
      const cell = triangles[i];
      // p.fill(palette[colorIndex]);
      // colorIndex = (colorIndex + palette.length - 1) % palette.length;
      
      p.strokeWeight(3);
      const triangle = cell.map(i => points[i]);

      const [a, b, c] = triangle;

      p.stroke("black");

      p.triangle(a.x, a.y, b.x, b.y, c.x, c.y);

      areas.push(drawInnerLines((triangle)));
    }

    console.log('min', p.min(areas));
    console.log('max', p.max(areas));
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