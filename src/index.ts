import p5, { Color } from 'p5';
import palettes from 'nice-color-palettes/100.json';

new p5((p: p5) => {
  let palette = p.random(palettes);
  let background = "white";

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(background);

    document.onkeydown = function(e) {
      if (e.metaKey && e.keyCode === 83) {
        p.saveCanvas(`zigzag-${Date.now()}`, "png")
        return false;
      }
    }
  };

  p.draw = () => {
    p.noStroke();
    
    let d = 50;
    palette = p.random(palettes);

    palette.forEach(( color, i ) => {
      console.log(color, i);
      p.fill(color);
      p.circle(p.windowWidth / 2 + (i * 10), p.windowHeight / 2, d);
    });
 
    p.noLoop();
  };
});