module.exports = Glyph;

function Glyph(offset, slr) {
	slr.goto(offset);

	this.numberOfContours = slr.getInt16();
	this.boundingBox = {};
	this.boundingBox.llX = slr.getInt16();
	this.boundingBox.llY = slr.getInt16();
	this.boundingBox.upX = slr.getInt16();
	this.boundingBox.upY = slr.getInt16();

	if (this.numberOfContours >= 0) {
		var endPtsOfContours = slr.getUint16Array(this.numberOfContours);
		var instructionLength = slr.getUint16();
		this.instructions = slr.getUint8Array(instructionLength);
		var totalNumberOfPoints = endPtsOfContours[endPtsOfContours.length - 1] + 1;
		this.flags = [];
		for (var i = 0; i < totalNumberOfPoints; i++) {
			var flag = slr.getUint8();
			this.flags.push(flag);
			if (flag & 0x08) {
				var repeat = slr.getUint8();
				for (var j = 0; j < repeat; j++) {
					this.flags.push(flag);
				}
				i += repeat;
			}
		}
		var xCoords = [],
			yCoords = [],
			x = 0, y = 0;
		for (var i = 0; i < totalNumberOfPoints; i++) {
			var flag = this.flags[i];
			if (flag & 0x10) {
				if (flag & 0x02) {
					x += slr.getUint8();
				}
			} else {
				if (flag & 0x02) {
					x += -(slr.getUint8())
				} else {
					x += slr.getInt16();
				}
			}
			xCoords[i] = x;
		}
		for (var i = 0; i < totalNumberOfPoints; i++) {
			var flag = this.flags[i];
			if (flag & 0x20) {
				if (flag & 0x04) {
					y += slr.getUint8();
				}
			} else {
				if (flag & 0x04) {
					y += -(slr.getUint8())
				} else {
					y += slr.getInt16();
				}
			}
			yCoords[i] = y;
		}
		this.xCoords = xCoords;
		this.yCoords = yCoords;
		this.endPtsOfContours = endPtsOfContours;
	} else if (this.numberOfContours === -1) {
		this.components = [];
		var component;
		do {
			component = {
				xscale: 1.0, yscale: 1.0,
				scale01: 0.0, scale10: 0.0
			};
			component.flags = slr.getUint16();
			component.glyphIndex = slr.getUint16();
			if (component.flags & 0x01) {
				component.argument1 = slr.getUint16();
				component.argument2 = slr.getUint16();
			} else {
				component.argument1 = slr.getUint8();
				component.argument2 = slr.getUint8();
			}
			if (component.flags & 0x02) {
				component.xtranslate = component.argument1;
				component.ytranslate = component.argument2;
			} else {
				component.point1 = component.argument1;
				component.point2 = component.argument2;
			}
			if (component.flags & 0x08) {
				var i = slr.getInt16();
				component.xscale = i / 0x4000;
				component.yscale = i / 0x4000;
			} else if (component.flags & 0x40) {
				component.xscale = slr.getInt16() / 0x4000;
				component.yscale = slr.getInt16() / 0x4000;
			} else if (component.flags & 0x80) {
				component.xscale = slr.getInt16() / 0x4000;
				component.scale01 = slr.getInt16() / 0x4000;
				component.scale10 = slr.getInt16() / 0x4000;
				component.yscale = slr.getInt16() / 0x4000;
			}
			this.components.push(component);
		} while (component.flags & 0x20);
	}
}

function linearTransformX(comp, x, y) {
	var x1 = Math.round(x * comp.xscale + y * comp.scale10);
	return x1 + comp.xtranslate;
}

function linearTransformY(comp, x, y) {
	var y1 = Math.round(x * comp.scale01 + y * comp.yscale);
	return y1 + comp.ytranslate;
}

Glyph.prototype.resolve = function (glyphs) {

	if (this.numberOfContours === -1) {
		var firstIndex = 0,
			firstContour = 0;
		this.glyphs = glyphs;
		for (var i in this.components) {
			var comp = this.components[i];
			comp.firstIndex = firstIndex;
			comp.firstContour = firstContour;
			var glyph = glyphs[comp.glyphIndex];
			if (glyph) {
				glyph.resolve(glyphs);
				firstIndex += glyph.getPointCount();
				firstContour += glyph.getContourCount();
			}
		}
	}
};
Glyph.prototype.getPointCount = function () {
	if (this.numberOfContours >= 0) {
		return this.flags.length;
	} else {
		var that = this;
		return this.components.reduce(function (p, c) {
			var glyph = that.glyphs[c.glyphIndex];
			return p + c.glyph.getPointCount();
		}, 0);
	}
};
Glyph.prototype.getContourCount = function () {
	if (this.numberOfContours >= 0) {
		return this.numberOfContours;
	} else {
		var that = this;
		return this.components.reduce(function (p, c) {
			var glyph = that.glyphs[c.glyphIndex];
			return p + glyph.getContourCount();
		}, 0);
	}
};
Glyph.prototype.getSegmentedPoints = function () {
	var xcoords = [], ycoords = [], flags = [];
	if (this.numberOfContours === 1) {
		xcoords.push(this.xCoords);
		ycoords.push(this.yCoords);
		flags.push(this.flags);
	} else if (this.numberOfContours > 1) {
		var start = 0;
		for (var i in this.endPtsOfContours) {
			xcoords.push(this.xCoords.slice(start, this.endPtsOfContours[i] + 1));
			ycoords.push(this.yCoords.slice(start, this.endPtsOfContours[i] + 1));
			flags.push(this.flags.slice(start, this.endPtsOfContours[i] + 1));
			start = this.endPtsOfContours[i] + 1;
		}
	} else if (this.numberOfContours === -1) {
		var that = this;
		this.components.forEach(function (comp) {
			var glyph = that.glyphs[comp.glyphIndex];
			var segmentedPoints = glyph.getSegmentedPoints();
			for (var i = 0; i < segmentedPoints.flags.length; i++) {
				var newXCoords = segmentedPoints.xcoords[i].map(function (xc, ind) {
					return linearTransformX(comp, xc, segmentedPoints.ycoords[i][ind]);
				});
				var newYCoords = segmentedPoints.ycoords[i].map(function (yc, ind) {
					return linearTransformY(comp, segmentedPoints.xcoords[i][ind], yc);
				});
				xcoords.push(newXCoords);
				ycoords.push(newYCoords);
				flags.push(segmentedPoints.flags[i]);
			}
		});
	}
	return { xcoords: xcoords, ycoords: ycoords, flags: flags }
};


Glyph.prototype.toSVGPath = function () {
	var bb = this.boundingBox;
	var svg = '';
	var segments = this.getSegmentedPoints();
	var xcoords = segments.xcoords,
		ycoords = segments.ycoords,
		flags = segments.flags;
	for (var i = 0; i < this.getContourCount(); i++) {
		for (var k = 0, n = flags[i].length; k < n; k++) {
			// Note: The last point of the last curve may wrap around to the
			// first point again, so the last index should be taken mod n
			if (k === 0) {
				svg += " M" + xcoords[i][k] + ',' + ycoords[i][k];
			} else if (flags[i][k] & 0x01) {
				svg += " L" + xcoords[i][k] + ',' + ycoords[i][k];
			} else {
				// On-curve points between two off-curve points are implied, for more
				// information see: http://math.stackexchange.com/questions/36005
				while (k < n && !(flags[i][k] & 0x01)) {
					var x0 = xcoords[i][k];
					var y0 = ycoords[i][k];
					var x1 = xcoords[i][(k + 1) % n];
					var y1 = ycoords[i][(k + 1) % n];
					if (k + 1 < n && !(flags[i][k + 1] & 0x01)) {
						x1 = (x0 + x1) / 2;
						y1 = (y0 + y1) / 2;
					}
					svg += " Q" + x0 + ',' + y0 + " " + x1 + ',' + y1;
					k++;
				}
			}
		}
	}
	return svg;
};