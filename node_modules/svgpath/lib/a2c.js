// Convert an arc to a sequence of cubic bézier curves
//

'use strict';

var TAU = Math.PI * 2;

// causes an error in case of a long url in comments
/* eslint-disable max-len */

// spaces are used for grouping throughout this file
/* eslint-disable space-infix-ops */

// Calculate an angle between two vectors
//
function vector_angle(ux, uy, vx, vy) {
  var sign = (ux * vy - uy * vx < 0) ? -1 : 1;
  var umag = Math.sqrt(ux * ux + uy * uy);
  var vmag = Math.sqrt(ux * ux + uy * uy);
  var dot  = ux * vx + uy * vy;
  var div  = dot / (umag * vmag);

  if (div > 1 || div < -1) {
    // rounding errors, e.g. -1.0000000000000002 can screw up this
    div = Math.max(div, -1);
    div = Math.min(div,  1);
  }

  return sign * Math.acos(div);
}

// Correction of out-of-range radii
//
function correct_radii(midx, midy, rx, ry) {
  rx = Math.abs(rx);
  ry = Math.abs(ry);

  var Λ = (midx * midx) / (rx * rx) + (midy * midy) / (ry * ry);
  if (Λ > 1) {
    rx *= Math.sqrt(Λ);
    ry *= Math.sqrt(Λ);
  }

  return [ rx, ry ];
}


// Convert from endpoint to center parameterization,
// see http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
//
// Return [cx, cy, θ1, Δθ]
//
function get_arc_center(x1, y1, x2, y2, fa, fs, rx, ry, sin_φ, cos_φ) {
  // Step 1.
  //
  // Moving an ellipse so origin will be the middlepoint between our two
  // points. After that, rotate it to line up ellipse axes with coordinate
  // axes.
  //
  var x1p =  cos_φ*(x1-x2)/2 + sin_φ*(y1-y2)/2;
  var y1p = -sin_φ*(x1-x2)/2 + cos_φ*(y1-y2)/2;

  var rx_sq  =  rx * rx;
  var ry_sq  =  ry * ry;
  var x1p_sq = x1p * x1p;
  var y1p_sq = y1p * y1p;

  // Step 2.
  //
  // Compute coordinates of the centre of this ellipse (cx', cy')
  // in the new coordinate system.
  //
  var radicant = (rx_sq * ry_sq) - (rx_sq * y1p_sq) - (ry_sq * x1p_sq);

  if (radicant < 0) {
    // due to rounding errors it might be e.g. -1.3877787807814457e-17
    radicant = 0;
  }

  radicant /=   (rx_sq * y1p_sq) + (ry_sq * x1p_sq);
  radicant = Math.sqrt(radicant) * (fa === fs ? -1 : 1);

  var cxp = radicant *  rx/ry * y1p;
  var cyp = radicant * -ry/rx * x1p;

  // Step 3.
  //
  // Transform back to get centre coordinates (cx, cy) in the original
  // coordinate system.
  //
  var cx = cos_φ*cxp - sin_φ*cyp + (x1+x2)/2;
  var cy = sin_φ*cxp + cos_φ*cyp + (y1+y2)/2;

  // Step 4.
  //
  // Compute angles (θ1, Δθ).
  //
  var v1x =  (x1p - cxp) / rx;
  var v1y =  (y1p - cyp) / ry;
  var v2x = (-x1p - cxp) / rx;
  var v2y = (-y1p - cyp) / ry;

  var θ1 = vector_angle(1, 0, v1x, v1y);
  var Δθ = vector_angle(v1x, v1y, v2x, v2y);

  if (fs === 0 && Δθ > 0) {
    Δθ -= TAU;
  }
  if (fs === 1 && Δθ < 0) {
    Δθ += TAU;
  }

  return [ cx, cy, θ1, Δθ ];
}

//
// Approximate one unit arc segment with bézier curves,
// see http://math.stackexchange.com/questions/873224/calculate-control-points-of-cubic-bezier-curve-approximating-a-part-of-a-circle
//
function approximate_unit_arc(θ1, Δθ) {
  var α = 4/3 * Math.tan(Δθ/4);

  var x1 = Math.cos(θ1);
  var y1 = Math.sin(θ1);
  var x2 = Math.cos(θ1 + Δθ);
  var y2 = Math.sin(θ1 + Δθ);

  return [ x1, y1, x1 - y1*α, y1 + x1*α, x2 + y2*α, y2 - x2*α, x2, y2 ];
}

module.exports = function a2c(x1, y1, x2, y2, fa, fs, rx, ry, φ) {
  var sin_φ = Math.sin(φ * TAU / 360);
  var cos_φ = Math.cos(φ * TAU / 360);

  // Make sure radii are valid
  //
  var x1p =  cos_φ*(x1-x2)/2 + sin_φ*(y1-y2)/2;
  var y1p = -sin_φ*(x1-x2)/2 + cos_φ*(y1-y2)/2;

  if (x1p === 0 && y1p === 0) {
    // we're asked to draw line to itself
    return [];
  }

  if (rx === 0 || ry === 0) {
    // one of the radii is zero
    return [];
  }

  var radii = correct_radii(x1p, y1p, rx, ry);
  rx = radii[0];
  ry = radii[1];

  // Get center parameters (cx, cy, θ1, Δθ)
  //
  var cc = get_arc_center(x1, y1, x2, y2, fa, fs, rx, ry, sin_φ, cos_φ);

  var result = [];
  var θ1 = cc[2];
  var Δθ = cc[3];

  // Split an arc to multiple segments, so each segment
  // will be less than τ/4 (= 90°)
  //
  var segments = Math.max(Math.ceil(Math.abs(Δθ) / (TAU / 4)), 1);
  Δθ /= segments;

  for (var i = 0; i < segments; i++) {
    result.push(approximate_unit_arc(θ1, Δθ));
    θ1 += Δθ;
  }

  // We have a bezier approximation of a unit circle,
  // now need to transform back to the original ellipse
  //
  return result.map(function (curve) {
    for (var i = 0; i < curve.length; i += 2) {
      var x = curve[i + 0];
      var y = curve[i + 1];

      // scale
      x *= rx;
      y *= ry;

      // rotate
      var xp = cos_φ*x - sin_φ*y;
      var yp = sin_φ*x + cos_φ*y;

      // translate
      curve[i + 0] = xp + cc[0];
      curve[i + 1] = yp + cc[1];
    }

    return curve;
  });
};
