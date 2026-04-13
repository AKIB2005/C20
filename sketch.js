// ─────────────────────────────────────────────
//  p5.play + Matter.js  –  Physics Playground
//  Click to drop shapes, Space to shake world
// ─────────────────────────────────────────────

// ── Config ──────────────────────────────────
const W = 640, H = 480;

// Shape mode: 1=circle, 2=box, 3=triangle
let shapeMode = 1;

// Sprite groups
let balls;       // falling physics objects
let walls;       // static boundary walls

// Colour palette
const PALETTE = [
  '#ff6b6b', '#ffa94d', '#ffe066',
  '#69db7c', '#4dabf7', '#cc5de8', '#f06595'
];

let bgGfx;       // off-screen background gradient

// ── p5 setup ────────────────────────────────
function setup() {
  let cnv = createCanvas(W, H);
  cnv.parent('canvas-container');

  // p5.play uses Matter.js under the hood; world gravity
  world.gravity.y = 10;

  buildWalls();
  balls = new Group();

  // Pre-render background so we don't recompute every frame
  bgGfx = createGraphics(W, H);
  drawBackground(bgGfx);
}

// ── p5 draw loop ─────────────────────────────
function draw() {
  // Static background
  image(bgGfx, 0, 0);

  // Grid overlay (subtle)
  drawGrid();

  // Draw all sprites (p5.play handles physics update automatically)
  drawSprites();

  // HUD: shape selector
  drawHUD();

  // Remove sprites that fell off the bottom
  for (let s of [...balls]) {
    if (s.y > H + 60) s.remove();
  }
}

// ── Input ────────────────────────────────────
function mousePressed() {
  spawnShape(mouseX, mouseY);
}

function keyPressed() {
  if (key === ' ') shakeWorld();
  if (key === '1') shapeMode = 1;
  if (key === '2') shapeMode = 2;
  if (key === '3') shapeMode = 3;
}

// ── Spawn a physics shape ────────────────────
function spawnShape(x, y) {
  let s = new balls.Sprite(x, y);
  s.color = random(PALETTE);
  s.stroke = false;
  s.mass   = random(1, 4);
  s.bounciness = 0.55;
  s.friction    = 0.4;

  // Give it a little random kick
  s.vel.x = random(-3, 3);
  s.vel.y = random(-2, 1);

  if (shapeMode === 1) {
    // Circle
    s.diameter = random(24, 56);
  } else if (shapeMode === 2) {
    // Box
    let sz = random(20, 50);
    s.width  = sz;
    s.height = sz * random(0.6, 1.4);
    s.rotation = random(-20, 20);
  } else {
    // Triangle (p5.play polygon)
    s.shape    = 'triangle';
    s.diameter = random(28, 54);
    s.rotation = random(0, 360);
  }

  // Cap total on-screen shapes to keep perf smooth
  if (balls.length > 80) balls[0].remove();
}

// ── Build static boundary walls ─────────────
function buildWalls() {
  walls = new Group();

  const defs = [
    // [x,      y,         w,    h,   label]
    [W / 2,   H + 15,    W,    30,  'floor'],
    [-15,     H / 2,     30,   H,   'left'],
    [W + 15,  H / 2,     30,   H,   'right'],
    // Two angled ramps in the middle
    [W * 0.27, H * 0.55, 180,  14,  'ramp1'],
    [W * 0.73, H * 0.72, 180,  14,  'ramp2'],
    // Shelf
    [W * 0.5,  H * 0.35, 120,  12,  'shelf'],
  ];

  const angles = { ramp1: -22, ramp2: 22, shelf: 0 };

  for (let [x, y, w, h, lbl] of defs) {
    let wall = new walls.Sprite(x, y, w, h, 'static');
    wall.color   = '#1e1e3a';
    wall.stroke  = '#3a3a6a';
    wall.strokeWeight = 2;
    if (angles[lbl]) wall.rotation = angles[lbl];
  }
}

// ── Shake all dynamic sprites ────────────────
function shakeWorld() {
  for (let s of balls) {
    s.vel.x += random(-12, 12);
    s.vel.y += random(-16, -4);
  }
}

// ── Background gradient (off-screen) ─────────
function drawBackground(g) {
  g.noStroke();
  for (let y = 0; y < H; y++) {
    let t   = y / H;
    let r   = lerp(18,  10,  t);
    let gr  = lerp(14,   8,  t);
    let b   = lerp(42,  24,  t);
    g.stroke(r, gr, b);
    g.line(0, y, W, y);
  }
}

// ── Subtle dot-grid ───────────────────────────
function drawGrid() {
  stroke(255, 255, 255, 8);
  strokeWeight(1);
  let step = 32;
  for (let x = step; x < W; x += step)
    for (let y = step; y < H; y += step)
      point(x, y);
}

// ── On-canvas HUD ────────────────────────────
function drawHUD() {
  noStroke();
  textSize(12);
  textAlign(LEFT, TOP);

  const labels = ['● Circle', '■ Box', '▲ Triangle'];
  for (let i = 0; i < 3; i++) {
    let active = (shapeMode === i + 1);
    fill(active ? '#cc99ff' : 'rgba(180,170,220,0.4)');
    rect(10, 10 + i * 26, 88, 22, 5);
    fill(active ? '#1a0033' : 'rgba(200,190,255,0.7)');
    text(`[${i + 1}] ${labels[i]}`, 16, 14 + i * 26);
  }

  // Count
  fill('rgba(200,190,255,0.5)');
  textAlign(RIGHT, TOP);
  text(`Shapes: ${balls.length}`, W - 10, 10);
}
