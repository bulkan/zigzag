import { Vector } from "p5";

export const areaOfTrig = (a: Vector, b: Vector, c:Vector) => {
   const top = (a.x * (b.y - c.y)) + (b.x * (c.y - a.y)) + (c.x * (a.y - b.y));
   return Math.abs((top / 2));
};
