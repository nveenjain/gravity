(function (){
  const canvas = document.querySelector("canvas");
  canvas.height = innerHeight;
  canvas.width = innerWidth;
  const ctx = canvas.getContext("2d");
  let score = 0;
  let level = 1;
  let nextLevel = 2000; // Score needed for level 2 - gets increased on level-up
  const touchEnabled = "ontouchstart" in document.documentElement;
  let situation1 = false;
  const gravityAcceleration = touchEnabled ? 200000 : 200000;
  const radius = touchEnabled ? 10 : 20;
  if (!ctx) {
    throw new Error("not gonna happen :P");
  }
  function distance(obj1, obj2) {
    return Math.sqrt(
      (obj1.x - obj2.x) * (obj1.x - obj2.x) +
        (obj1.y - obj2.y) * (obj1.y - obj2.y)
    );
  }
  let Stars = [];
  let Planets = [];
  function Motion(object, constant) {
    if (object === this) return;
    let r = distance(object, this);
    let ax =
      (constant || gravityAcceleration) * ((object.x - this.x) / r) / (r * r);
    let ay =
      (constant || gravityAcceleration) * ((object.y - this.y) / r) / (r * r);
    this.vx = this.vx + ax;
    this.vy = this.vy + ay;
    if (
      distance(this, object) <= (2*radius) ||
      this.collided == true ||
      this.x < -(2*radius) ||
      this.x > (2*radius) + canvas.width ||
      this.y > canvas.height + (2*radius) ||
      this.y < -(2*radius)
    ) {
      score -= 200;
      this.collided = true;
      Planets = Planets.filter(planet => planet != this);
      return;
    }
  }
  class Planet {
    constructor(x, y, vx, vy, style) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.style = style;
      ctx.beginPath();
      ctx.fillStyle = style || "blue";
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
      Planets.push(this);
      this.collided = false;
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.style || "blue";
      Stars.forEach(star=>Motion.call(this,star));
      this.x = this.x + this.vx / 60;
      this.y = this.y + this.vy / 60;
      let collision_count = 0;
      Planets.forEach(planet => {
        Motion.call(this, planet, 150000);
        if (planet == this) {
          return;
        }
        if (distance(this, planet) <= (2*radius)) {
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
      ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
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
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
      Stars.push(this);
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = "yellow";
      ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }
  new Star(canvas.width / 2, canvas.height / 2);
  let eventOfClick = {};
  function leftHandlerDown(e) {
    if (situation1) {
      let timeNow = new Date().getTime();
      eventOfClick = { time: timeNow, x: e.clientX, y: e.clientY };
    }
  }
  function leftHandlerUp(e) {
    if (situation1) {
      let timeElapsed = Number(new Date().getTime()) - Number(eventOfClick.time);
      const vx = (e.clientX - eventOfClick.x) / (timeElapsed / 1000);
      const vy = (e.clientY - eventOfClick.y) / (timeElapsed / 1000);
      new Planet(eventOfClick.x, eventOfClick.y, vx, vy);
    } else {
      situation1 = true;
      redraw();
    }
  }
  function rightHandler(e) {
    e.preventDefault();
    new Star(e.clientX, e.clientY);
  }
  if (!touchEnabled) {
    canvas.addEventListener("mousedown", leftHandlerDown);
    canvas.addEventListener("mouseup", leftHandlerUp);
    canvas.addEventListener("contextmenu", rightHandler);
  } else {
      canvas.addEventListener("touchstart", e => {
        leftHandlerDown(e.changedTouches[0]);
      });
    canvas.addEventListener("touchend", e => {
      leftHandlerUp(e.changedTouches[0]);
    });
    canvas.addEventListener("contextmenu", rightHandler);
  }
  function calculateScore() {
    score += Planets.length * Stars.length * 5;
    if (Planets.length == 0) score -= 1;
    if (score > nextLevel && score < nextLevel + (nextLevel / 200)) {
      levelUp();
    }
  }
  function levelUp() {
    let sunLocationX = randomInt(radius, innerWidth - radius);
    let sunLocationY = randomInt(radius + 100, innerHeight - radius);
    let existingX = [];
    let existingY = [];
    let distance = 20; // Default max distance new stars should have from existing ones

    Stars.forEach(function(star) {
      existingX.push(star.x);
      existingY.push(star.y);
    });

    let i = 0;

    while (i < existingX.length) {
      for (var z = 0; z < existingX.length; z++) {
        if (!between(sunLocationX, existingX[z] - distance, // If not within 20px of any existing x co-ords
            existingX[z] + distance)) {
              // Is OK - not close to existing co-ordinate
              i++;
        }
      }
      if (i < existingX.length) {
        // Give new x co-ord and repeat loop to check new co-ord
        sunLocationX = randomInt(radius, innerWidth - radius);
        i = 0;
      } // else: Is OK. Keep this co-ordinate
    }
    i = 0;
    while (i < existingY.length) {
      for (var z = 0; z < existingY.length; z++) {
        if (!between(sunLocationY, existingY[z] - distance, // If not within 20px of any existing y co-ords
            existingY[z] + distance)) {
              // Is OK - not close to existing co-ordinate
              i++;
        }
      }
      if (i < existingY.length) {
        // Give new y co-ord and repeat loop to check new co-ord
        sunLocationY = randomInt(radius +100, innerHeight - radius);
        i = 0;
      } // else: Is OK. Keep this co-ordinate
    }

    level += 1; // Increase level by 1
    new Star(sunLocationX, sunLocationY); // Place new Sun in random location
    nextLevel = nextLevel * 2; // Increase score requirement for next level

    function randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function between(x, min, max) {
      if (x >= min && x <= max) {
        return true;
      } else {
          return false;
      }
    }

  }
  function redraw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    calculateScore();
    ctx.fillStyle = "white";
    if (situation1) {
      if (!touchEnabled) {
        ctx.font = "48px Comic Sans";
        ctx.fillText(`Your Score: ${score}`, 50, 50);
        ctx.font = "48px Comic Sans";
        ctx.fillText(`Level: ${level}`, 500, 50);
        ctx.font = "48px Comic Sans";
        ctx.fillText(`Next Level: ${nextLevel}`, 800, 50);
        ctx.font = "18px Comic Sans";
        ctx.fillText("Press H for help", 80, 80);
      } else {
        ctx.font = "30px Comic Sans";
        ctx.fillText(`Your Score: ${score}`, 50, 50);
        ctx.font = "30px Comic Sans";
        ctx.fillText(`Level: ${level}`, 50, 80);
        ctx.font = "30px Comic Sans";
        ctx.fillText(`Next Level: ${nextLevel}`, 50, 110);
      }
      Stars.forEach(star => star.draw());
      Planets.forEach(planet => {
        planet.draw();
      });
      window.requestAnimationFrame(redraw);
    } else {
      if (!touchEnabled) {
        ctx.font = "20px Comic Sans";
        ctx.fillStyle = "white";
        ctx.fillText(
          "Left Click creates planets, slide while click to give initial speed",
          10,
          50
        );
        ctx.fillText("Right Click creates Stars", 10, 80);
        ctx.fillText(
          "As long as any planet lives, Score keeps increasing, otherwise penalty.",
          10,
          140
        );
        ctx.fillText(
          "The more the celestial bodies, more the score gained per second",
          10,
          170
        );
        ctx.fillText(
          "If planet's center is outside the universe, it causes planet's destruction.",
          10,
          200
        );
        ctx.fillText(
          "Collision with any celestial body results in penalty",
          10,
          110
        );
        ctx.fillText("Press Esc/Click to continue game", 10, 230);
        ctx.fillText(
          "Created by Naveen(@nveenjain) on github, twitter, gmail",
          10,
          260
        );
      } else {
        ctx.font = "12px Comic Sans";
        ctx.fillStyle = "white";
        ctx.fillText(
          "Touch and slide to creates planets and to give initial speed",
          10,
          50
        );
        ctx.fillText("Touch and hold to create stars", 10, 80);
        ctx.fillText(
          "As long as any planet lives, Score keeps increasing, otherwise penalty.",
          10,
          140
        );
        ctx.fillText(
          "The more the celestial bodies, more the score gained per second",
          10,
          170
        );
        ctx.fillText(
          "If planet's center is outside the universe, it causes planet's destruction.",
          10,
          200
        );
        ctx.fillText(
          "Collision with any celestial body results in penalty",
          10,
          110
        );
        ctx.fillText("Click anywhere to continue game", 10, 230);
      }
    }
  }
  window.requestAnimationFrame(redraw);
  window.addEventListener("keydown", e => {
    if (e.keyCode == 72) {
      situation1 = false;
    } else if (e.keyCode == 27) {
      situation1 = true;
      redraw();
    }
  });
})();
