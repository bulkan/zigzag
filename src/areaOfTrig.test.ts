import p5 from "p5";
import { areaOfTrig } from "./util";

const createVector = (coords) => {
  const [x, y] = coords;
  const v = new p5.Vector();
  v.x = x;
  v.y = y;
  return v;
}

const TEST_TABLE = [
  [[23, 18], [23, 30], [47, 23], 144],
  [[15, 15], [23, 30], [50, 25], 222.50],
  [[-7, 0], [23, 30], [47, 23], 465],
  [[23, 18], [23, 18], [23, 18], 0],
  [[-10, -10], [-10, 50], [90, 30], 3000],
];

describe('areaOfTrig', () => {
  it.each(TEST_TABLE)(`made up of %p, %p, %p should equal %p`, (a, b, c, expected) => {
    const av = createVector(a);
    const bv = createVector(b);
    const cv = createVector(c);
    
    expect(areaOfTrig(av, bv, cv)).toEqual(expected);
  });
})