'use strict';

var _ = require('lodash');
var DOMParser = require('xmldom').DOMParser;
var math  = require('./math');
var ucs2 = require('./ucs2');

function getGlyph(glyphElem) {
  var glyph = {};

  glyph.d = glyphElem.getAttribute('d').trim();
  glyph.unicode = [];

  if (glyphElem.getAttribute('unicode')) {
    glyph.character = glyphElem.getAttribute('unicode');
    var unicode = ucs2.decode(glyph.character);

    // If more than one code point is involved, the glyph is a ligature glyph
    if(unicode.length > 1) {
      glyph.ligature = glyph.character;
      glyph.ligatureCodes = unicode;
    } else {
      glyph.unicode.push(unicode[0]);
    }
  }

  glyph.name = glyphElem.getAttribute('glyph-name');

  if (glyphElem.getAttribute('horiz-adv-x')) {
    glyph.width = parseInt(glyphElem.getAttribute('horiz-adv-x'), 10);
  }

  return glyph;
}

function deduplicateGlyps(glyphs, ligatures) {
  // Result (the list of unique glyphs)
  var result = [];

  _.forEach(glyphs, function(glyph) {
    // Search for glyphs with the same properties (width and d)
    var canonical = _.find(result, {width: glyph.width, d: glyph.d});
    if(canonical) {
      // Add the code points to the unicode array.
      // The fields “name” and “character” are not that important so we leave them how we first enounter them and throw the rest away
      canonical.unicode = canonical.unicode.concat(glyph.unicode);
      glyph.canonical = canonical;
    } else {
      result.push(glyph);
    }
  });

  // Update ligatures to point to the canonical version
  _.forEach(ligatures, function(ligature) {
    while(_.has(ligature.glyph, 'canonical')) {
      ligature.glyph = ligature.glyph.canonical;
    }
  });

  return result;
}

function load(str) {
  var attrs;

  var doc = (new DOMParser()).parseFromString(str, 'application/xml');

  var metadata, fontElem, fontFaceElem;

  metadata = doc.getElementsByTagName('metadata')[0];
  fontElem = doc.getElementsByTagName('font')[0];

  if (!fontElem) {
    throw new Error("Can't find <font> tag. Make sure you SVG file is font, not image.");
  }

  fontFaceElem = fontElem.getElementsByTagName('font-face')[0];

  var font = {
    id: fontElem.getAttribute('id') || 'fontello',
    familyName: fontFaceElem.getAttribute('font-family') || 'fontello',
    stretch: fontFaceElem.getAttribute('font-stretch') || 'normal'
  };

  // Doesn't work with complex content like <strong>Copyright:></strong><em>Fontello</em>
  if (metadata && metadata.textContent) {
    font.metadata = metadata.textContent;
  }

  // Get <font> numeric attributes
  attrs = {
    width:        'horiz-adv-x',
    //height:       'vert-adv-y',
    horizOriginX: 'horiz-origin-x',
    horizOriginY: 'horiz-origin-y',
    vertOriginX:  'vert-origin-x',
    vertOriginY:  'vert-origin-y'
  };
  _.forEach(attrs, function(val, key) {
    if (fontElem.hasAttribute(val)) { font[key] = parseInt(fontElem.getAttribute(val), 10); }
  });

  // Get <font-face> numeric attributes
  attrs = {
    ascent:     'ascent',
    descent:    'descent',
    unitsPerEm: 'units-per-em'
  };
  _.forEach(attrs, function(val, key) {
    if (fontFaceElem.hasAttribute(val)) { font[key] = parseInt(fontFaceElem.getAttribute(val), 10); }
  });

  if (fontFaceElem.hasAttribute('font-weight')) {
    font.weightClass = fontFaceElem.getAttribute('font-weight');
  }

  var missingGlyphElem = fontElem.getElementsByTagName('missing-glyph')[0];
  if (missingGlyphElem) {

    font.missingGlyph = {};
    font.missingGlyph.d = missingGlyphElem.getAttribute('d') || '';

    if (missingGlyphElem.getAttribute('horiz-adv-x')) {
      font.missingGlyph.width = parseInt(missingGlyphElem.getAttribute('horiz-adv-x'), 10);
    }
  }

  var glyphs = [];
  var ligatures = [];

  _.forEach(fontElem.getElementsByTagName('glyph'), function (glyphElem) {
    var glyph = getGlyph(glyphElem);

    if(_.has(glyph, 'ligature')) {
      ligatures.push({
        ligature: glyph.ligature,
        unicode: glyph.ligatureCodes,
        glyph: glyph
      });
    }

    glyphs.push(glyph);
  });

  glyphs = deduplicateGlyps(glyphs, ligatures);

  font.glyphs = glyphs;
  font.ligatures = ligatures;

  return font;
}


function cubicToQuad(segment, index, x, y) {
  if (segment[0] === 'C') {
    var quadCurves = math.bezierCubicToQuad(
      new math.Point(x, y),
      new math.Point(segment[1], segment[2]),
      new math.Point(segment[3], segment[4]),
      new math.Point(segment[5], segment[6]),
      0.3
    );

    var res = [];
    _.forEach(quadCurves, function(curve) {
      res.push(['Q', curve[1].x, curve[1].y, curve[2].x, curve[2].y]);
    });
    return res;
  }
}


// Converts svg points to contours.  All points must be converted
// to relative ones, smooth curves must be converted to generic ones
// before this conversion.
//
function toSfntCoutours(svgPath) {
  var resContours = [];
  var resContour = [];

  svgPath.iterate(function(segment, index, x, y) {

    //start new contour
    if (index === 0 || segment[0] === 'M') {
      resContour = [];
      resContours.push(resContour);
    }

    var name = segment[0];
    if (name === 'Q') {
      //add control point of quad spline, it is not on curve
      resContour.push({ x: segment[1], y: segment[2], onCurve: false });
    }

    // add on-curve point
    if (name === 'H') {
      // vertical line has Y coordinate only, X remains the same
      resContour.push({ x: segment[1], y: y, onCurve: true });
    } else if (name === 'V') {
      // horizontal line has X coordinate only, Y remains the same
      resContour.push({ x: x, y: segment[1], onCurve: true });
    } else if (name !== 'Z') {
      // for all commands (except H and V) X and Y are placed in the end of the segment
      resContour.push({ x: segment[segment.length - 2], y: segment[segment.length - 1], onCurve: true });
    }

  });
  return resContours;
}


module.exports.load = load;
module.exports.cubicToQuad = cubicToQuad;
module.exports.toSfntCoutours = toSfntCoutours;
