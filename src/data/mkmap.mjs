// Build-once: project Natural Earth 50m boundaries into SVG paths for the
// Where We Work map. Output is baked into a .ts data file; nothing runs at runtime.
import fs from 'node:fs';

// Natural Earth uses ADM0_A3 'SDS' for South Sudan, not the ISO 'SSD'.
const FOCUS = { KEN: 'Kenya', ETH: 'Ethiopia', SDS: 'South Sudan' };
const CONTEXT = {
  UGA: 'Uganda', TZA: 'Tanzania', SOM: 'Somalia', SDN: 'Sudan',
  ERI: 'Eritrea', DJI: 'Djibouti', RWA: 'Rwanda', BDI: 'Burundi',
  COD: 'DR Congo', CAF: 'CAR', EGY: 'Egypt', SAU: 'Saudi Arabia', YEM: 'Yemen',
};
const WANT = { ...FOCUS, ...CONTEXT };

const gj = JSON.parse(fs.readFileSync('ne50.geojson', 'utf8'));

// --- Projection: equirectangular with a cosine correction at the region's mid-latitude.
// Honest enough at this scale and keeps the shapes free of Mercator's polar stretch.
const LAT0 = 6, LON0 = 36;
const K = Math.cos((LAT0 * Math.PI) / 180);
const project = ([lon, lat]) => [(lon - LON0) * K, -(lat - LAT0)];

// --- Douglas-Peucker, so 50m detail survives where it matters and vanishes where it doesn't.
function perp(p, a, b) {
  const [px, py] = p, [ax, ay] = a, [bx, by] = b;
  const dx = bx - ax, dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perp(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]];
  return [...simplify(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplify(pts.slice(idx), tol)];
}

const R = (n) => Math.round(n * 100) / 100;

function ringsOf(geom) {
  if (geom.type === 'Polygon') return [geom.coordinates[0]];
  if (geom.type === 'MultiPolygon') return geom.coordinates.map((p) => p[0]);
  return [];
}

function toPath(geom, tol, minPts) {
  const parts = [];
  for (const ring of ringsOf(geom)) {
    const projected = ring.map(project);
    const simplified = simplify(projected, tol);
    // Drop slivers and offshore specks; they read as noise at this size.
    if (simplified.length < minPts) continue;
    parts.push(
      'M' + simplified.map(([x, y]) => `${R(x)} ${R(y)}`).join('L') + 'Z'
    );
  }
  return parts.join('');
}

// Area-weighted centroid of the largest ring: where a country label sits best.
function centroid(geom) {
  let best = null, bestArea = 0;
  for (const ring of ringsOf(geom)) {
    const pts = ring.map(project);
    let a = 0, cx = 0, cy = 0;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const cross = pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
      a += cross;
      cx += (pts[j][0] + pts[i][0]) * cross;
      cy += (pts[j][1] + pts[i][1]) * cross;
    }
    a /= 2;
    if (Math.abs(a) > bestArea) { bestArea = Math.abs(a); best = [cx / (6 * a), cy / (6 * a)]; }
  }
  return best ? [R(best[0]), R(best[1])] : [0, 0];
}

const out = { focus: [], context: [] };
let bounds = [Infinity, Infinity, -Infinity, -Infinity];

for (const f of gj.features) {
  const iso = f.properties.ADM0_A3 || f.properties.ISO_A3;
  if (!WANT[iso]) continue;
  const isFocus = Boolean(FOCUS[iso]);
  // Focus countries keep fine detail; neighbours are context only.
  const d = toPath(f.geometry, isFocus ? 0.035 : 0.09, isFocus ? 4 : 6);
  if (!d) continue;

  if (isFocus) {
    for (const ring of ringsOf(f.geometry)) {
      for (const c of ring) {
        const [x, y] = project(c);
        bounds = [Math.min(bounds[0], x), Math.min(bounds[1], y), Math.max(bounds[2], x), Math.max(bounds[3], y)];
      }
    }
  }
  const shape = { iso, name: WANT[iso], d };
  if (isFocus) shape.label = centroid(f.geometry);
  (isFocus ? out.focus : out.context).push(shape);
}

// viewBox framed on the three focus countries, with breathing room for context shapes.
const pad = 3.2;
const vb = [
  R(bounds[0] - pad), R(bounds[1] - pad),
  R(bounds[2] - bounds[0] + pad * 2), R(bounds[3] - bounds[1] + pad * 2),
];

const size = (o) => o.reduce((n, c) => n + c.d.length, 0);
console.log('focus:', out.focus.map((c) => c.iso).join(','), size(out.focus), 'chars');
console.log('context:', out.context.map((c) => c.iso).join(','), size(out.context), 'chars');
console.log('viewBox:', vb.join(' '));

const ts = `// GENERATED — do not edit by hand.
// Source: Natural Earth 50m admin-0 (public domain), projected equirectangular
// (cosine-corrected at 6°N) and Douglas-Peucker simplified. Regenerated only if
// the map's geography changes; see scratchpad/mkmap.mjs in the original session.

export const VIEW_BOX = '${vb.join(' ')}';

export interface Shape {
  iso: string;
  name: string;
  d: string;
  /** Area-weighted centroid, in viewBox units. Focus shapes only. */
  label?: [number, number];
}

/** The three countries VLA works in. */
export const FOCUS_SHAPES: Shape[] = ${JSON.stringify(out.focus, null, 2)};

/** Neighbours, drawn as faint outlines so the region reads as a real place. */
export const CONTEXT_SHAPES: Shape[] = ${JSON.stringify(out.context, null, 2)};
`;

fs.writeFileSync('mapShapes.ts', ts);
console.log('wrote mapShapes.ts', ts.length, 'chars');
