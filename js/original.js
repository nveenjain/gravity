(function() {
  const canvas = document.querySelector("canvas");
  canvas.height = innerHeight;
  canvas.width = innerWidth;
  const ctx = canvas.getContext("2d");
  let score = 0;
  if (!ctx) {
    return undefined;
  }
  function distance(obj1, obj2) {
    return Math.sqrt(
      (obj1.x - obj2.x) * (obj1.x - obj2.x) +
        (obj1.y - obj2.y) * (obj1.y - obj2.y)
    );
  }
  let Stars = [];
  let Planets = [];
  class Planet {
    constructor(x, y, vx, vy, style) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.style = style;
      ctx.beginPath();
      ctx.fillStyle = style || "blue";
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
      Planets.push(this);
      this.collided = false;
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.style || "blue";
      Stars.forEach(star => {
        let r = distance(star, this);
        let ax = 200000 * ((star.x - this.x) / r) / (r * r);
        let ay = 200000 * ((star.y - this.y) / r) / (r * r);
        this.x = this.x + this.vx / 60;
        this.y = this.y + this.vy / 60;
        this.vx = this.vx + ax;
        this.vy = this.vy + ay;
        if (
          distance(this, star) <= 40 ||
          this.collided == true ||
          this.x < -40 ||
          this.x > 40 + canvas.width ||
          this.y > canvas.height + 40 ||
          this.y < -40
        ) {
          score -= 200;
          Planets = Planets.filter(planet => planet != this);
          this.collided = true;
          return;
        }
      });
      let collision_count = 0;
      Planets.forEach(planet => {
        if (planet == this) {
          return;
        }
        if (distance(this, planet) <= 40) {
          planet.collided = true;
          this.collided = true;
          collision_count++;
        }
      });
      if (collision_count > 0) {
        Planets = Planets.filter(planet => planet != this);
        score -= 50 * collision_count;
        return;
      }
      ctx.arc(this.x, this.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }
  class Star {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      ctx.beginPath();
      ctx.fillStyle = "yellow";
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
      Stars.push(this);
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = "yellow";
      ctx.arc(this.x, this.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }
  new Star(canvas.width / 2, canvas.height / 2);
  let eventOfClick = {};
  canvas.addEventListener("mousedown", e => {
    let timeNow = new Date().getTime();
    eventOfClick = { time: timeNow, x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("mouseup", e => {
    let timeElapsed = Number(new Date().getTime()) - Number(eventOfClick.time);
    const vx = (e.clientX - eventOfClick.x) / (timeElapsed / 1000);
    const vy = (e.clientY - eventOfClick.y) / (timeElapsed / 1000);
    new Planet(eventOfClick.x, eventOfClick.y, vx, vy);
  });
  canvas.addEventListener("contextmenu", e => {
    e.preventDefault();
    new Star(e.clientX, e.clientY);
  });
  function calculateScore() {
    score += Planets.length * Stars.length * 5;
    if(Planets.length==0)
        score-=1;
  }
  let situation1 = true;
  function redraw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    calculateScore();
    ctx.fillStyle = "white";
    if(situation1){
        ctx.font = "48px Comic Sans";
        ctx.fillText(`Your Score: ${score}`, 50, 50);
        ctx.font = "18px Comic Sans";
        ctx.fillText("Press H for help", 80, 80);
        Stars.forEach(star => star.draw());
        Planets.forEach(planet => {
          planet.draw();
        });
        window.requestAnimationFrame(redraw);
        
    }else{
        ctx.font = "20px Comic Sans";
        ctx.fillStyle = "white";
        ctx.fillText("Left Click creates planets, slide while click to give initial speed", 10,50);
        ctx.fillText("Right Click creates Stars", 10,80);
        ctx.fillText("As long as any planet lives, Score keeps increasing, otherwise penalty.", 10,140);
        ctx.fillText("The more the celestial bodies, more the score gained per second", 10,170);
        ctx.fillText("If planet's center is outside the universe, it causes planet's destruction.", 10,200);
        ctx.fillText("Collision with any celestial body results in penalty", 10,110);
        ctx.fillText("Press Esc to continue game", 10,230);
        ctx.fillText("Created by Naveen(@nveenjain) on github, twitter, gmail", 10,260);

    }
  }
  window.requestAnimationFrame(redraw);
  window.addEventListener("keydown",e=>{
    if(e.keyCode==72){
        situation1 = false;
    }else if(e.keyCode==27){
        situation1 = true;
        redraw();
    }  
});
})();
