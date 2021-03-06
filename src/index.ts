import p5, { Vector } from "p5";
import dt from "delaunay-triangulate";
import { areaOfTrig } from "./util";

type ZigZagParams = {
  large?: boolean;
}

new p5((p: p5) => {
  let background = "white";
  let square;
  let areaOfSquare;
  let cornerPoints;
  
  let scaleFactor = 1;
  let points: Array<Vector>;
  let triangles: Array<Array<number>>;

  let offset = 20;
  const squareOffset = 100;
  const MAX_POINTS = 40;

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

  function drawLines(canvas, innerLineCount, triangle) {
    const [a, b, c] = triangle;

    for (let i = 0; i < innerLineCount; i++) {
      let xa = p.map(i, 0, innerLineCount, a.x, c.x);
      let ya = p.map(i, 0, innerLineCount, a.y, c.y);
      let xb = p.map(i, 0, innerLineCount, b.x, c.x);
      let yb = p.map(i, 0, innerLineCount, b.y, c.y);

      canvas.line(xa * scaleFactor, ya * scaleFactor, xb * scaleFactor, yb * scaleFactor);
    }
  }
  
  function drawInnerLines(canvas, triangle) {
    const [a, b, c] = triangle;
    const area = areaOfTrig(a, b, c);

    const angles = getAngles(triangle);
    const twoAnglesSame = (new Set(angles.map(a => p.floor(a)))).size !== angles.length;
    const isSkinnyTriangle = angles.some(ang => ang < 7);
    
    const maxLines = isSkinnyTriangle ? 50 * scaleFactor : 200;

    let innerLineCount = p.floor(p.map(p.log(area * 0.0001 + 1), 0, 12, 1, maxLines, true));
    let strokeWeight = p.floor(p.map(p.log(area * 0.0001 + 1), 0, 12 * scaleFactor, 5 * scaleFactor, 1, true));
    
    p.strokeWeight((strokeWeight));
    
    if (!twoAnglesSame) {
      drawLines(canvas, innerLineCount, triangle);
    } else if (isSkinnyTriangle) {
      drawLines(canvas, innerLineCount, [c, b, a]); // horizontal
    } else {
      drawLines(canvas, innerLineCount, [c, a, b]); // left
    }
  }

  function makeArt(canvas) { 
    canvas.pixelDensity(window.devicePixelRatio || 1);
    canvas.background(background);
    canvas.noFill();
    const frameThickness = 10 * scaleFactor;

    canvas.stroke("black");
    canvas.strokeWeight(frameThickness);

    canvas.translate(canvas.width / 2, canvas.height / 2);

    // center of the square
    const frameX = -square * scaleFactor / 2;
    const frameY = -square * scaleFactor / 2;

    // outer rect - frame
    canvas.rect(frameX - offset, frameY - offset, (square * scaleFactor) + offset * 2, (square  * scaleFactor) + offset * 2);

    // inner rect - frame
    canvas.rect(frameX - (scaleFactor), frameY - (scaleFactor), (square * scaleFactor), (square  * scaleFactor));
  
    canvas.translate(frameX, frameY);

    canvas.stroke("black");
    canvas.strokeWeight(5 * scaleFactor);

    for (let i = 0; i < triangles.length; i++) {
      const cell = triangles[i];

      canvas.strokeWeight(3 * scaleFactor);
      const triangle = cell.map(i => points[i]);

      const [a, b, c] = triangle;

      canvas.stroke("black");

      canvas.triangle(a.x * scaleFactor, a.y * scaleFactor, b.x * scaleFactor, b.y * scaleFactor, c.x * scaleFactor, c.y * scaleFactor);

      drawInnerLines(canvas, triangle);
    }

    console.log('done drawing');
  }

  p.setup = () => {    
    p.createCanvas(p.windowWidth, p.windowHeight);
    // p.pixelDensity(window.devicePixelRatio || 1);

    document.onkeydown = function(e) {
      if (e.metaKey && e.keyCode === 83) {

        scaleFactor = 2;
        offset *= scaleFactor;

        const canvas = p.createGraphics(p.windowWidth * scaleFactor + offset, p.windowHeight * scaleFactor + offset);
        makeArt(canvas);
        p.save(canvas, `zigzag-${Date.now()}`, "png");

        return false;
      }
    };

    square = fitSquares(p.width - squareOffset, p.height - squareOffset, 1);

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

    points = [
      ...cornerPoints,
      // p.createVector(square / 2, 100),
      // p.createVector(10, 200),
      // p.createVector(square - 10, 200),
      ...points
    ];

    triangles = dt(points.map(p => [p.x, p.y]));
    p.noLoop();
  };

  p.draw = () => makeArt(p);
});

function fitSquares(width: number, height: number, n) {
  let sx = 0
  let sy = 0;

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