let amps = [0, 0, 0, 0, 0, 0];
let delays = [0, 0, 0, 0, 0, 0];
let chordNames = ["C", "G", "Am", "F"];
let chordHues = [40, 200, 280, 130];
let chordFreqs = [[130.81, 164.81, 196.0],
                [98.0, 123.47, 146.83],
                [110.0, 130.81, 164.81],
                [87.31, 110.0, 130.81]
              ];
let current = 0;
let chordSounds = [];
let soundVol = 0;
let bend = 1;
let mic;
let audioStarted = false;
let prevStickY = 0;
let previousButtons = [];
let prevTrigger = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  for (let i = 0; i < 3; i++) {
    let sound = new p5.Oscillator("triangle");
    sound.amp(0);
    sound.start();
    chordSounds.push(sound);
  }
  mic = new p5.AudioIn();
}

function draw() {
  let hue = chordHues[current];
  background(hue, 50, 8, 20);
  bend = 1;
  
  let gp = navigator.getGamepads()[0];
  if (gp) {
    handleController(gp);
  }
  if (keyIsDown(LEFT_ARROW)) {
    bend = 0.94;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    bend = 1.06;
  }
  
  let vol = 0;
  if (audioStarted) {
    vol = mic.getLevel();
  }
  
  for (let i = 0; i < 3; i++) {
    chordSounds[i].freq(chordFreqs[current][i] * bend, 0.05);
    chordSounds[i].amp(soundVol, 0.02);
  }
  soundVol = soundVol * 0.96;
  
  drawStrings(hue, vol);
  titles(gp);
}

function drawStrings(hue, vol) {
  noFill();
  for (let i = 0; i < 6; i++) {
    if (delays[i] > 0) {
      delays[i]--;
      if (delays[i] === 0) {
        amps[i] = random(25, 45);
      }
    }
    let baseY = map(i, 0, 5, height * 0.3, height * 0.75);
    let a = amps[i] + vol * 200;
    
     push();
    stroke((hue + i * 12) % 360, 70, 100, 90);
    strokeWeight(1 + i * 0.6 + vol * 20);
    beginShape();
    for (let j = 0; j <= width; j += 10) {
      let ends = sin(map(j, 0, width, 0, PI));
      let wave = sin(j * 0.03 * bend + frameCount * 0.5 + i);
      vertex(j, baseY + wave * a * ends);
    }
    endShape();
    pop();
    amps[i] = amps[i] * 0.95;
  }
}

function strum(direction) {
  for (let i = 0; i < 6; i++) {
    if (direction === "up") {
      delays[i] = (5 - i) * 3 + 1;
    } else {
      delays[i] = i * 3 + 1;
    }
  }
  if (audioStarted) {
    if (direction === "up") {
      soundVol = 0.18;
    } else {
      soundVol = 0.25;
    }
  }
}

function playChord(index) {
  current = index;
  strum();
}

function handleController(gp) {
  let deadzone = 0.15;
  let stickX = abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
  bend = 1 + stickX * 0.06;
  
  let rightTrigger = gp.buttons[7].value;
  if (rightTrigger > 0.5 && prevTrigger <= 0.5) {
    strum();
  }
  prevTrigger = rightTrigger;
  
  let stickY = gp.axes[5];
  if (stickY > 0.5 && prevStickY <= 0.5) {
    strum("down");
  }
  if (stickY < -0.5 && prevStickY >= -0.5) {
    strum("up");
  }
  prevStickY = stickY;
  
  gp.buttons.forEach((button, index) =>{
    let currentlyPressed = button.pressed;
    let previouslyPressed = previousButtons[index] || false;
    if (currentlyPressed && !previouslyPressed) {
      console.log("button pressed:", index); 
      switch (index) {
        case 0: // A
          playChord(0); // C
          break;
        case 1: // B
          playChord(1); // G
          break;
        case 3: // X
          playChord(3); // F
          break;
        case 4: // Y
          playChord(2); // Am
          break;
      }
    }
    previousButtons[index] = currentlyPressed;
  });
}

function titles(gp) {
  noStroke();
  fill(0, 0, 100);
  textAlign(LEFT, TOP);

  textSize(32);
  text("My Guitar", 30, 30);

  textAlign(RIGHT, TOP);
  textSize(64);
  fill(chordHues[current], 60, 100);
  text(chordNames[current], width - 30, 25);
}

function keyPressed() {
  if (key === "1") playChord(0);
  if (key === "2") playChord(1);
  if (key === "3") playChord(2);
  if (key === "4") playChord(3);
  if (key === " ") strum();
  if (keyCode === DOWN_ARROW) strum("down");
  if (keyCode === UP_ARROW) strum("up");
}

function mousePressed() {
  if (!audioStarted) {
    userStartAudio();
    mic.start();
    audioStarted = true;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}