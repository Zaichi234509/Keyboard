import * as THREE from '../vendor/three.module.min.js';

/* ------------------------------------------------------------------
   HU TAO · FRAGRANCE IN THAW  —  procedural 3D keyboard
   Everything below is generated in code: case, plate, 87 keycaps,
   dye-sub legends, plum-blossom deck art, RGB underglow, embers.
------------------------------------------------------------------- */

const U = 1.0;            // 1 key unit
const KEY = 0.94;         // keycap footprint
const KH = 0.62;          // keycap height
const CASE_H = 1.15;
const PAD = 0.5;

/* Colourway sampled directly from the product render (assets/hero.jpg):
   ivory alphas · khaki-olive modifiers & nav cluster · dark plum number row
   and F1–F4 / F9–F12 · crimson Esc + arrows · lightest ivory spacebar.      */
const COL = {
  cream:   0xE6DCBE,   // alphas
  ivory:   0xF1EAD4,   // spacebar — lightest cap on the board
  plum:    0x53242F,   // number row, F1–F4, F9–F12, Enter
  olive:   0xA69C6E,   // modifiers, Backspace, nav + fn clusters
  crimson: 0xAF2130,   // Esc, arrow cluster
  ink:     0x1A181C,
};
const LEGEND = {
  cream:   '#463124',
  ivory:   '#4A3527',
  plum:    '#E4D5B7',
  olive:   '#2C2718',
  crimson: '#F2DFC6',
  ink:     '#C9BFA6',
};
// glyph prefixes the render shows on the wide modifiers
const GLYPH = {
  'Tab': '⇥', 'Caps Lock': '⇪', 'Shift': '⇧', 'Backspace': '←', 'Enter': '↵',
};

/* ---------- layout ------------------------------------------------ */
// [label, width, colorKey, sublabel?]
const L = (label, w = 1, c = 'cream', sub = '') => ({ label, w, c, sub });

const ROWS = [
  { y: 0, keys: [
    [0,    L('Esc', 1, 'crimson')],
    [2,    L('F1',1,'plum')], [3, L('F2',1,'plum')], [4, L('F3',1,'plum')], [5, L('F4',1,'plum')],
    [6.5,  L('F5',1,'olive')], [7.5,L('F6',1,'olive')], [8.5,L('F7',1,'olive')], [9.5,L('F8',1,'olive')],
    [11,   L('F9',1,'plum')], [12, L('F10',1,'plum')],[13, L('F11',1,'plum')],[14, L('F12',1,'plum')],
    [15.25,L('PrtSc',1,'olive')], [16.25,L('ScrLk',1,'olive')], [17.25,L('Pause',1,'olive')],
  ]},
  { y: 1.5, keys: [
    [0,L('~',1,'plum','`')],[1,L('!',1,'plum','1')],[2,L('@',1,'plum','2')],[3,L('#',1,'plum','3')],
    [4,L('$',1,'plum','4')],[5,L('%',1,'plum','5')],[6,L('^',1,'plum','6')],[7,L('&',1,'plum','7')],
    [8,L('*',1,'plum','8')],[9,L('(',1,'plum','9')],[10,L(')',1,'plum','0')],[11,L('_',1,'plum','-')],
    [12,L('+',1,'plum','=')],[13,L('Backspace',2,'olive')],
    [15.25,L('Insert',1,'olive')],[16.25,L('Home',1,'olive')],[17.25,L('PgUp',1,'olive')],
  ]},
  { y: 2.5, keys: [
    [0,L('Tab',1.5,'olive')],[1.5,L('Q')],[2.5,L('W')],[3.5,L('E')],[4.5,L('R')],[5.5,L('T')],
    [6.5,L('Y')],[7.5,L('U')],[8.5,L('I')],[9.5,L('O')],[10.5,L('P')],[11.5,L('{',1,'cream','[')],
    [12.5,L('}',1,'cream',']')],[13.5,L('|',1.5,'cream','\\')],
    [15.25,L('Delete',1,'olive')],[16.25,L('End',1,'olive')],[17.25,L('PgDn',1,'olive')],
  ]},
  { y: 3.5, keys: [
    [0,L('Caps Lock',1.75,'olive')],[1.75,L('A')],[2.75,L('S')],[3.75,L('D')],[4.75,L('F')],[5.75,L('G')],
    [6.75,L('H')],[7.75,L('J')],[8.75,L('K')],[9.75,L('L')],[10.75,L(':',1,'cream',';')],
    [11.75,L('"',1,'cream',"'")],[12.75,L('Enter',2.25,'plum')],
  ]},
  { y: 4.5, keys: [
    [0,L('Shift',2.25,'olive')],[2.25,L('Z')],[3.25,L('X')],[4.25,L('C')],[5.25,L('V')],[6.25,L('B')],
    [7.25,L('N')],[8.25,L('M')],[9.25,L('<',1,'cream',',')],[10.25,L('>',1,'cream','.')],
    [11.25,L('?',1,'cream','/')],[12.25,L('Shift',2.75,'olive')],
    [16.25,L('▲',1,'crimson')],
  ]},
  { y: 5.5, keys: [
    [0,L('Ctrl',1.25,'olive')],[1.25,L('❖',1.25,'olive')],[2.5,L('Alt',1.25,'olive')],
    [3.75,L('__GHOST__',6.25,'ivory')],
    [10,L('Alt',1.25,'olive')],[11.25,L('❖',1.25,'olive')],[12.5,L('Fn',1.25,'olive')],[13.75,L('Ctrl',1.25,'olive')],
    [15.25,L('◀',1,'crimson')],[16.25,L('▼',1,'crimson')],[17.25,L('▶',1,'crimson')],
  ]},
];

const BOARD_W = 18.25;
const BOARD_D = 6.5;

/* ---------- geometry helpers -------------------------------------- */
function roundedRectShape(w, d, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);        s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);    s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);        s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);            s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function roundedBox(w, d, h, r, bevel = 0.05, seg = 2) {
  const shape = roundedRectShape(w - bevel * 2, d - bevel * 2, Math.max(0.01, r - bevel));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: h - bevel * 2, bevelEnabled: true, bevelSize: bevel,
    bevelThickness: bevel, bevelSegments: seg, curveSegments: 5,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  geo.translate(-(bb.max.x + bb.min.x) / 2, -bb.min.y, -(bb.max.z + bb.min.z) / 2);
  return geo;
}

// keycap: rounded box tapered toward the top with an absolute inset
function keycapGeo(units) {
  const w = units * U - (U - KEY);
  const geo = roundedBox(w, KEY, KH, 0.11, 0.045, 2);
  const pos = geo.attributes.position;
  const hw = w / 2, hd = KEY / 2, inset = 0.085;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const t = Math.min(1, Math.max(0, y / KH));
    const e = t * t * inset;
    pos.setX(i, x * ((hw - e) / hw));
    pos.setZ(i, z * ((hd - e) / hd));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/* ---------- canvas textures --------------------------------------- */
const texCache = new Map();

function drawGhost(ctx, cx, cy, s, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(cx - s, cy + s * 0.85);
  ctx.lineTo(cx - s, cy - s * 0.1);
  ctx.bezierCurveTo(cx - s, cy - s * 1.35, cx + s, cy - s * 1.35, cx + s, cy - s * 0.1);
  ctx.lineTo(cx + s, cy + s * 0.85);
  ctx.lineTo(cx + s * 0.6, cy + s * 0.5);
  ctx.lineTo(cx + s * 0.2, cy + s * 0.85);
  ctx.lineTo(cx - s * 0.2, cy + s * 0.5);
  ctx.lineTo(cx - s * 0.6, cy + s * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2b1e19';
  ctx.beginPath(); ctx.ellipse(cx - s * 0.4, cy - s * 0.25, s * 0.13, s * 0.2, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + s * 0.4, cy - s * 0.25, s * 0.13, s * 0.2, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#c8474f';
  ctx.beginPath(); ctx.ellipse(cx - s * 0.72, cy + s * 0.05, s * 0.17, s * 0.11, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + s * 0.72, cy + s * 0.05, s * 0.17, s * 0.11, 0, 0, 7); ctx.fill();
}

function drawBlossom(ctx, cx, cy, r, color, core = '#F2C14E') {
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62,
      r * 0.46, r * 0.36, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2); ctx.fill();
}

function drawButterfly(ctx, cx, cy, s, rot, color) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(-s * 0.55, -s * 0.2, s * 0.55, s * 0.38, -0.5, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s * 0.55, -s * 0.2, s * 0.55, s * 0.38, 0.5, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-s * 0.4, s * 0.35, s * 0.34, s * 0.24, 0.5, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s * 0.4, s * 0.35, s * 0.34, s * 0.24, -0.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#33201c';
  ctx.beginPath(); ctx.ellipse(0, 0.05 * s, s * 0.09, s * 0.42, 0, 0, 7); ctx.fill();
  ctx.restore();
}

function legendTexture(key) {
  const id = key.label + '|' + key.sub + '|' + key.c + '|' + key.w;
  if (texCache.has(id)) return texCache.get(id);

  const px = 128;
  const cw = Math.max(px, Math.round(px * key.w));
  const cv = document.createElement('canvas');
  cv.width = cw; cv.height = px;
  const ctx = cv.getContext('2d');
  const col = LEGEND[key.c];

  if (key.label === '__GHOST__') {
    drawGhost(ctx, cw * 0.42, px * 0.52, px * 0.26, '#F7F1E2');
    drawButterfly(ctx, cw * 0.62, px * 0.5, px * 0.14, -0.3, '#D9762F');
    drawBlossom(ctx, cw * 0.25, px * 0.55, px * 0.1, '#B33240');
    drawBlossom(ctx, cw * 0.76, px * 0.6, px * 0.075, '#B33240');
  } else if (key.label === 'Esc') {
    ctx.fillStyle = col;
    ctx.font = `600 ${px * 0.26}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('Esc', px * 0.13, px * 0.12);
    drawBlossom(ctx, px * 0.68, px * 0.7, px * 0.19, '#F0D9BC', '#8A1A26');
  } else if (key.w >= 1.5 && GLYPH[key.label]) {
    // wide modifiers: glyph over left-aligned word, as on the real caps
    ctx.fillStyle = col;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const pad = px * 0.17;
    ctx.font = `500 ${px * 0.30}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(GLYPH[key.label], pad, px * 0.34);
    ctx.font = `600 ${px * 0.215}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(key.label, pad, px * 0.70);
  } else if (key.w >= 1.25 && key.label.length > 1) {
    // Ctrl / Alt / Fn: left-aligned, lower third
    ctx.fillStyle = col;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = `600 ${px * 0.235}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(key.label, px * 0.17, px * 0.63);
  } else {
    ctx.fillStyle = col;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const long = key.label.length > 2;
    if (key.sub) {
      ctx.font = `500 ${px * 0.25}px ui-sans-serif, system-ui, sans-serif`;
      ctx.fillText(key.label, cw / 2, px * 0.33);
      ctx.font = `600 ${px * 0.30}px ui-sans-serif, system-ui, sans-serif`;
      ctx.fillText(key.sub, cw / 2, px * 0.68);
    } else {
      const size = long ? px * 0.215 : px * 0.40;
      ctx.font = `600 ${size}px ui-sans-serif, system-ui, sans-serif`;
      ctx.fillText(key.label, cw / 2, px * 0.52);
    }
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  texCache.set(id, t);
  return t;
}

// black deck art: plum branches + butterflies, drawn around the key field
function deckArtTexture(w, d) {
  const S = 2048;
  const cv = document.createElement('canvas');
  cv.width = S; cv.height = Math.round(S * d / w);
  const ctx = cv.getContext('2d');
  const H = cv.height;

  const g = ctx.createLinearGradient(0, 0, S, H);
  g.addColorStop(0, '#191519'); g.addColorStop(0.5, '#131117'); g.addColorStop(1, '#1C1418');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, H);

  // subtle brushed noise
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.016})`;
    ctx.fillRect(Math.random() * S, Math.random() * H, 2, 1);
  }

  const branch = (x, y, len, ang, wdt, depth) => {
    if (depth <= 0 || len < 12) return;
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    ctx.strokeStyle = '#2E2119'; ctx.lineWidth = wdt; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(ang - 0.4) * len * 0.6, y + Math.sin(ang - 0.4) * len * 0.6, x2, y2);
    ctx.stroke();
    if (Math.random() > 0.25) drawBlossom(ctx, x2, y2, 9 + Math.random() * 11, '#9E1F2B', '#E4A93C');
    branch(x2, y2, len * 0.68, ang + (Math.random() - 0.35) * 1.0, wdt * 0.62, depth - 1);
    if (Math.random() > 0.35) branch(x2, y2, len * 0.6, ang - (Math.random() - 0.3) * 1.1, wdt * 0.6, depth - 1);
  };

  // The render keeps the deck black and pushes the plum branches out to the
  // borders: heavy on the left flank, a spray in the top-right, a trail along
  // the bottom edge under the spacebar.
  branch(-30, H * 0.18, 150, 0.62, 10, 6);
  branch(-30, H * 0.52, 140, 0.30, 9, 6);
  branch(-30, H * 0.88, 130, -0.42, 9, 5);
  branch(S * 0.06, H + 30, 120, -1.25, 8, 5);
  branch(S * 0.34, H + 30, 110, -1.75, 7, 5);
  branch(S + 30, H * 0.16, 150, Math.PI - 0.55, 10, 6);
  branch(S + 30, H * 0.62, 135, Math.PI + 0.35, 9, 5);
  branch(S * 0.86, -30, 115, 1.55, 8, 5);
  branch(S * 0.62, -30, 95, 1.25, 6, 4);

  // butterflies hug the same border regions rather than scattering everywhere
  const BFLY = [
    [0.045, 0.30], [0.09, 0.74], [0.20, 0.93], [0.36, 0.08],
    [0.55, 0.95], [0.71, 0.06], [0.88, 0.24], [0.955, 0.66], [0.13, 0.12],
  ];
  BFLY.forEach(([u, v], i) => {
    drawButterfly(ctx, u * S, v * H, 13 + (i % 3) * 6,
      (i * 1.7) % 6, ['#D9762F', '#B8332F', '#E0A03A'][i % 3]);
  });
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// transparent overlay for the case side walls: plum branches climbing the bezel
function sideArtTexture(w, h, dense) {
  const S = 1024;
  const cv = document.createElement('canvas');
  cv.width = S; cv.height = Math.max(48, Math.round(S * h / w));
  const ctx = cv.getContext('2d');
  const H = cv.height;

  const branch = (x, y, len, ang, wdt, depth) => {
    if (depth <= 0 || len < 7) return;
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    ctx.strokeStyle = '#3A281C'; ctx.lineWidth = wdt; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(ang - 0.45) * len * 0.6, y + Math.sin(ang - 0.45) * len * 0.6, x2, y2);
    ctx.stroke();
    if (Math.random() > 0.2) drawBlossom(ctx, x2, y2, H * 0.09 + Math.random() * H * 0.07, '#A81F2B', '#E4A93C');
    branch(x2, y2, len * 0.66, ang + (Math.random() - 0.4) * 1.1, wdt * 0.6, depth - 1);
    if (Math.random() > 0.4) branch(x2, y2, len * 0.58, ang - (Math.random() - 0.3) * 1.2, wdt * 0.58, depth - 1);
  };

  const n = dense ? 5 : 3;
  for (let i = 0; i < n; i++) {
    const x0 = S * ((i + 0.35) / n) + (Math.random() - 0.5) * S * 0.1;
    branch(x0, H * 1.15, H * 0.62, -1.5 + (Math.random() - 0.5) * 1.1, H * 0.075, 4);
  }
  for (let i = 0; i < (dense ? 3 : 2); i++) {
    drawBlossom(ctx, S * (0.18 + 0.31 * i), H * (0.3 + Math.random() * 0.35), H * 0.1, '#8E1B26', '#D89A34');
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function envTexture(renderer) {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 256;
  const c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, '#2a2026');
  g.addColorStop(0.35, '#171319');
  g.addColorStop(0.6, '#3a1218');
  g.addColorStop(1.0, '#08070a');
  c.fillStyle = g; c.fillRect(0, 0, 512, 256);
  // warm key highlight + cool fill, gives metal something to reflect
  const blob = (x, y, r, col) => {
    const rg = c.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = rg; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  };
  blob(120, 60, 130, 'rgba(255,225,190,0.95)');
  blob(400, 90, 110, 'rgba(255,90,70,0.55)');
  blob(300, 210, 150, 'rgba(120,60,255,0.18)');
  const tex = new THREE.CanvasTexture(cv);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose(); tex.dispose();
  return env;
}

/* ---------- scene -------------------------------------------------- */
export function createKeyboardScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.85));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0709, 0.016);
  scene.environment = envTexture(renderer);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 250);
  const root = new THREE.Group();
  scene.add(root);

  /* --- case --- */
  const caseW = BOARD_W + PAD * 2, caseD = BOARD_D + PAD * 2;
  const caseMat = new THREE.MeshPhysicalMaterial({
    color: 0x121014, metalness: 0.55, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.4,
  });
  const caseMesh = new THREE.Mesh(roundedBox(caseW, caseD, CASE_H, 0.34, 0.1, 3), caseMat);
  caseMesh.position.y = 0;
  caseMesh.castShadow = true; caseMesh.receiveShadow = true;
  root.add(caseMesh);

  // blossom art wrapping the case side walls (as in the product render)
  const sideMatOpts = (tex) => ({
    map: tex, transparent: true, roughness: 0.5, metalness: 0.2,
    clearcoat: 0.6, clearcoatRoughness: 0.3, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  const wallY = CASE_H * 0.5;
  const wallH = CASE_H * 0.92;
  [
    { w: caseW, rotY: 0,             z: caseD / 2 + 0.011, x: 0, dense: true  }, // front
    { w: caseW, rotY: Math.PI,       z: -caseD / 2 - 0.011, x: 0, dense: false }, // back
    { w: caseD, rotY: -Math.PI / 2,  z: 0, x: -caseW / 2 - 0.011, dense: true  }, // left
    { w: caseD, rotY: Math.PI / 2,   z: 0, x: caseW / 2 + 0.011,  dense: false }, // right
  ].forEach((s) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(s.w * 0.985, wallH),
      new THREE.MeshPhysicalMaterial(sideMatOpts(sideArtTexture(s.w, wallH, s.dense)))
    );
    m.position.set(s.x, wallY, s.z);
    m.rotation.y = s.rotY;
    root.add(m);
  });

  // deck (top surface art)
  const deckMat = new THREE.MeshPhysicalMaterial({
    map: deckArtTexture(caseW, caseD), roughness: 0.55, metalness: 0.25,
    clearcoat: 0.7, clearcoatRoughness: 0.25,
  });
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(caseW - 0.16, caseD - 0.16), deckMat);
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = CASE_H + 0.001;
  deck.receiveShadow = true;
  root.add(deck);

  // underglow diffuser strip
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xff5a1e, transparent: true, opacity: 0.95 });
  const glow = new THREE.Mesh(roundedBox(caseW + 0.1, caseD + 0.1, 0.14, 0.36, 0.05, 1), glowMat);
  glow.position.y = -0.16;
  root.add(glow);

  // soft glow halo on the floor
  const haloCv = document.createElement('canvas'); haloCv.width = haloCv.height = 256;
  const hx = haloCv.getContext('2d');
  const hg = hx.createRadialGradient(128, 128, 0, 128, 128, 128);
  hg.addColorStop(0, 'rgba(255,70,45,0.75)');
  hg.addColorStop(0.45, 'rgba(220,50,40,0.22)');
  hg.addColorStop(1, 'rgba(0,0,0,0)');
  hx.fillStyle = hg; hx.fillRect(0, 0, 256, 256);
  const haloTex = new THREE.CanvasTexture(haloCv);
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(caseW * 1.9, caseD * 3.4),
    new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -1.55;
  root.add(halo);

  // wet reflective floor with a smeared amber/crimson streak, as in the render
  const flCv = document.createElement('canvas'); flCv.width = 512; flCv.height = 512;
  const fx = flCv.getContext('2d');
  fx.fillStyle = '#07060a'; fx.fillRect(0, 0, 512, 512);
  const smear = (x, y, rx, ry, col) => {
    const g = fx.createRadialGradient(x, y, 0, x, y, 1);
    fx.save(); fx.translate(x, y); fx.scale(rx, ry); fx.translate(-x, -y);
    const rg = fx.createRadialGradient(x, y, 0, x, y, 1);
    rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
    fx.fillStyle = rg; fx.beginPath(); fx.arc(x, y, 1, 0, 7); fx.fill();
    fx.restore(); void g;
  };
  smear(210, 250, 200, 46, 'rgba(255,60,40,0.75)');
  smear(320, 300, 150, 30, 'rgba(255,150,50,0.65)');
  smear(150, 330, 120, 22, 'rgba(255,40,30,0.45)');
  for (let i = 0; i < 2600; i++) {
    fx.fillStyle = `rgba(255,${140 + Math.random() * 90 | 0},90,${Math.random() * 0.05})`;
    fx.fillRect(Math.random() * 512, 200 + Math.random() * 180, 2 + Math.random() * 20, 1);
  }
  const flTex = new THREE.CanvasTexture(flCv);
  flTex.colorSpace = THREE.SRGBColorSpace;
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 90),
    new THREE.MeshStandardMaterial({
      map: flTex, roughness: 0.14, metalness: 0.85,
      transparent: true, opacity: 0.9,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.6;
  floor.receiveShadow = true;
  root.add(floor);

  /* --- plate + switch pins (visible through the gaps) --- */
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(BOARD_W + 0.3, 0.08, BOARD_D + 0.3),
    new THREE.MeshStandardMaterial({ color: 0x0b0a0d, metalness: 0.8, roughness: 0.5 })
  );
  plate.position.y = CASE_H + 0.05;
  root.add(plate);

  /* --- keycaps --- */
  const capMats = {};
  for (const k in COL) {
    capMats[k] = new THREE.MeshPhysicalMaterial({
      color: COL[k], roughness: 0.62, metalness: 0.02,
      clearcoat: 0.22, clearcoatRoughness: 0.6, sheen: 0.25, sheenColor: 0x3a2a24,
    });
  }
  const geoCache = new Map();
  const getCapGeo = (w) => {
    if (!geoCache.has(w)) geoCache.set(w, keycapGeo(w));
    return geoCache.get(w);
  };

  const keys = [];
  const baseY = CASE_H + 0.09;
  // amber per-key backlight bleed, matching the render's warm glow in the gaps
  const switchGeo = new THREE.BoxGeometry(0.62, 0.3, 0.62);
  const switchMat = new THREE.MeshStandardMaterial({
    color: 0xff7a1e, emissive: 0xff8a24, emissiveIntensity: 2.4, roughness: 0.6,
  });

  ROWS.forEach((row, ri) => {
    row.keys.forEach(([x, k]) => {
      const g = new THREE.Group();
      const cx = -BOARD_W / 2 + x + (k.w * U) / 2;
      const cz = -BOARD_D / 2 + row.y + 0.5;
      g.position.set(cx, baseY, cz);

      const cap = new THREE.Mesh(getCapGeo(k.w), capMats[k.c]);
      cap.castShadow = true; cap.receiveShadow = true;
      g.add(cap);

      const legend = new THREE.Mesh(
        new THREE.PlaneGeometry((k.w * U - (U - KEY)) - 0.19, KEY - 0.19),
        new THREE.MeshBasicMaterial({ map: legendTexture(k), transparent: true, depthWrite: false })
      );
      legend.rotation.x = -Math.PI / 2;
      legend.position.y = KH + 0.002;
      g.add(legend);

      // rgb bleed under each cap
      const sw = new THREE.Mesh(switchGeo, switchMat);
      sw.position.y = -0.14;
      g.add(sw);

      root.add(g);
      keys.push({ g, ri, x, base: baseY, press: 0, target: 0, seed: Math.random() * 100, cap });
    });
  });

  /* --- embers --- */
  const N = 260;
  const pgeo = new THREE.BufferGeometry();
  const pp = new Float32Array(N * 3), pv = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pp[i * 3] = (Math.random() - 0.5) * 46;
    pp[i * 3 + 1] = Math.random() * 22 - 3;
    pp[i * 3 + 2] = (Math.random() - 0.5) * 34;
    pv[i] = 0.4 + Math.random() * 1.6;
  }
  pgeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const spriteCv = document.createElement('canvas'); spriteCv.width = spriteCv.height = 64;
  const sx = spriteCv.getContext('2d');
  const sg = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
  sg.addColorStop(0, 'rgba(255,220,160,1)'); sg.addColorStop(0.3, 'rgba(255,110,50,0.55)');
  sg.addColorStop(1, 'rgba(255,60,30,0)');
  sx.fillStyle = sg; sx.fillRect(0, 0, 64, 64);
  const embers = new THREE.Points(pgeo, new THREE.PointsMaterial({
    size: 0.3, map: new THREE.CanvasTexture(spriteCv), transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.85,
  }));
  scene.add(embers);

  /* --- lights --- */
  const key = new THREE.DirectionalLight(0xffe9d0, 2.6);
  key.position.set(-11, 17, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -16; key.shadow.camera.right = 16;
  key.shadow.camera.top = 14; key.shadow.camera.bottom = -14;
  key.shadow.camera.far = 60; key.shadow.bias = -0.0012;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xff5a3c, 2.4);
  rim.position.set(13, 5, -12);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0x9fb8ff, 0.35);
  fill.position.set(6, 4, 14);
  scene.add(fill);

  const under1 = new THREE.PointLight(0xff6a16, 26, 20, 2); under1.position.set(-7, -0.6, 1.5);
  const under2 = new THREE.PointLight(0xff8a1e, 22, 20, 2); under2.position.set(7, -0.6, 1.5);
  const under3 = new THREE.PointLight(0xff3a22, 16, 18, 2); under3.position.set(0, -0.6, -3);
  scene.add(under1, under2, under3);
  scene.add(new THREE.AmbientLight(0x4a3a44, 0.55));

  /* --- interaction / state --- */
  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2(-9, -9);
  let hovered = null;
  let mx = 0, my = 0, tmx = 0, tmy = 0;

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    tmx = ptr.x; tmy = ptr.y;
  });
  window.addEventListener('pointermove', (e) => {
    tmx = (e.clientX / innerWidth) * 2 - 1;
    tmy = -(e.clientY / innerHeight) * 2 + 1;
  });

  // reveal animation: caps drop into place
  let intro = 0;
  keys.forEach((k) => { k.introDelay = 0.0035 * (k.x * 3 + k.ri * 9) + Math.random() * 0.12; });

  /* --- camera choreography ---------------------------------------- */
  // p: 0 -> 1 across the sticky stage
  // oy = vertical offset of the board itself, so it can duck below the headline
  const CAM = [
    // hero: board parked low, tilted up toward camera, behind the wordmark
    { p: 0.00, pos: [0, 12, 34],     look: [0, 0, 0],     rot: -0.34, tilt: 0.26, fov: 34, oy: -15 },
    // three-quarter deck reveal
    { p: 0.24, pos: [-13, 15, 27],   look: [-1.5, 1.0, 0],rot:  0.44, tilt: 0.15, fov: 33, oy: 0 },
    // flat plan view of the whole layout
    { p: 0.50, pos: [0, 33, 1.2],    look: [0, 0.4, 0],   rot:  0.00, tilt: 0.02, fov: 34, oy: 0 },
    // low macro across the keycaps
    { p: 0.74, pos: [9.5, 4.2, 17],  look: [3.5, 1.4, 0], rot: -0.50, tilt: 0.34, fov: 26, oy: 0 },
    // pull back out
    { p: 1.00, pos: [0, 13, 35],     look: [0, 0, 0],     rot:  0.20, tilt: 0.24, fov: 33, oy: -3.5 },
  ];
  // widen the framing on narrow / portrait viewports so the board always fits
  function fitScale() {
    const a = camera.aspect || 1.6;
    return a >= 1.6 ? 1 : Math.min(3.1, Math.pow(1.6 / a, 0.80));
  }
  const ease = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const tmpLook = new THREE.Vector3();

  function applyCam(p) {
    let i = 0;
    while (i < CAM.length - 2 && p > CAM[i + 1].p) i++;
    const a = CAM[i], b = CAM[i + 1];
    const t = ease(Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p))));
    const f = fitScale();
    camera.position.set(
      (lerp(a.pos[0], b.pos[0], t) + mx * 1.5) * f,
      (lerp(a.pos[1], b.pos[1], t) + my * 1.1) * f,
      lerp(a.pos[2], b.pos[2], t) * f
    );
    tmpLook.set(lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t), lerp(a.look[2], b.look[2], t));
    camera.lookAt(tmpLook);
    camera.fov = lerp(a.fov, b.fov, t);
    camera.updateProjectionMatrix();
    root.rotation.y = lerp(a.rot, b.rot, t) + mx * 0.06;
    root.rotation.x = lerp(a.tilt, b.tilt, t);
    root.position.y = lerp(a.oy, b.oy, t) * f;
  }

  let progress = 0, shown = true;
  const api = {
    setProgress(p) { progress = Math.min(1, Math.max(0, p)); },
    setVisible(v) { shown = v; },
    resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    pressRandom() {
      const k = keys[(Math.random() * keys.length) | 0];
      k.target = 1; setTimeout(() => { k.target = 0; }, 110);
    },
    scene, camera, renderer,
  };

  /* --- loop -------------------------------------------------------- */
  const clock = new THREE.Clock();
  let acc = 0, typeTimer = 0;

  function frame() {
    requestAnimationFrame(frame);
    if (!shown) return;

    const dt = Math.min(0.05, clock.getDelta());
    acc += dt;

    mx += (tmx - mx) * Math.min(1, dt * 3.2);
    my += (tmy - my) * Math.min(1, dt * 3.2);

    if (intro < 1) intro = Math.min(1, intro + dt * 0.42);

    // hover raycast (throttled by frame parity)
    if (ptr.x > -8) {
      ray.setFromCamera(ptr, camera);
      const hit = ray.intersectObjects(keys.map(k => k.cap), false)[0];
      const h = hit ? keys.find(k => k.cap === hit.object || k.g === hit.object.parent) : null;
      if (h !== hovered) {
        if (hovered) hovered.target = 0;
        hovered = h;
        if (hovered) hovered.target = 1;
      }
    }

    // idle typing ripple
    typeTimer -= dt;
    if (typeTimer <= 0) { api.pressRandom(); typeTimer = 0.11 + Math.random() * 0.22; }

    for (const k of keys) {
      k.press += (k.target - k.press) * Math.min(1, dt * 16);
      const introT = Math.min(1, Math.max(0, (intro - k.introDelay) / 0.55));
      const e = 1 - Math.pow(1 - introT, 3);
      const float = Math.sin(acc * 1.1 + k.seed) * 0.008;
      k.g.position.y = k.base + (1 - e) * 5.5 - k.press * 0.19 + float;
      k.g.rotation.z = (1 - e) * 0.25 * (k.seed % 2 ? 1 : -1);
      const s = 0.6 + 0.4 * e;
      k.g.scale.setScalar(s);
    }

    // rgb underglow breathing
    const b = 0.72 + Math.sin(acc * 1.4) * 0.22;
    glowMat.opacity = 0.55 + b * 0.4;
    glowMat.color.setHSL(0.045 + Math.sin(acc * 0.35) * 0.025, 0.95, 0.44 + b * 0.12);
    under1.intensity = 20 + b * 12;
    under2.intensity = 16 + Math.sin(acc * 1.4 + 1.2) * 9 + 8;
    under3.intensity = 12 + b * 8;
    switchMat.emissiveIntensity = 1.4 + b * 1.6;
    halo.material.opacity = 0.55 + b * 0.3;

    // embers
    const arr = pgeo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] += pv[i] * dt * 0.9;
      arr[i * 3] += Math.sin(acc * 0.5 + i) * dt * 0.14;
      if (arr[i * 3 + 1] > 19) {
        arr[i * 3 + 1] = -3;
        arr[i * 3] = (Math.random() - 0.5) * 46;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 34;
      }
    }
    pgeo.attributes.position.needsUpdate = true;
    embers.rotation.y = acc * 0.012;

    applyCam(progress);
    renderer.render(scene, camera);
  }

  api.resize();
  frame();
  return api;
}
