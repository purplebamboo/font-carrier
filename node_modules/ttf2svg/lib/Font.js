var nameLabels =
	['Copyright notice', 'Font family', 'Font subfamily', 'Subfamily identifier', 'Full name', 'Version',
		'Postscript name', 'Trademark notice', 'Manufacturer name', 'Designer', 'Description', 'Vendor Url',
		'Designer Url', 'License'];

var platformIds =
	['Unicode', 'Macintosh', undefined, 'Microsoft'];

var macEncodingIds =
	['Roman', 'Japansese', 'Traditional Chinese', 'Korean', 'Arabic', 'Hebrew', 'Greek', 'Russian', 'RSymbol',
		'Devanagari', 'Gurmukhi', 'Gujarati', 'Oriya', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
		'Sinhalese', 'Burmese', 'Khmer', 'Thai', 'Laotian', 'Georgian', 'Armenian', 'Simplified Chinese', 'Tibetan',
		'Mongolian', 'Geez', 'Slavic', 'Vietnamese', 'Sindhi'];

var uniEncodingIds =
	['Default semantics', 'Version 1.1 semantics', 'ISO 10646 1993 semantics (deprecated)',
		'Unicode 2.0 or later semantics'];


var initializers = require('./initializers');


module.exports = Font;

function Font(slr) {
	this.stream = slr;
	this.tables = [];
}

Font.prototype.initTables = function () {
	initializers['head'](this);
	initializers['hhea'](this);
	initializers['maxp'](this);
	initializers['hmtx'](this);
	initializers['post'](this);
	initializers['loca'](this);
	initializers['glyf'](this);
	initializers['cmap'](this);
	initializers['kern'](this);
};

Font.prototype.getMeta = function () {
	var names = this.getNamesForFont(0);
	var meta = {};

	names.forEach(function (record) {
		if (record.nameID <= 13) {
			meta[nameLabels[record.nameID]] = record.text;
		}
	});

	return meta;
};

Font.prototype.getNamesForFont = function (lang) {
	if (lang === undefined) {
		return this.name;
	}
	return this.name.records.filter(function (name) {
		return lang === undefined || name.language === lang;
	});
};

Font.prototype.getGlyphIndexForCharacterCode = function (charc) {
	var code = charc.charCodeAt(0);
	for (var i in this.cmap.cmaps) {
		var glyphIndex = this.cmap.cmaps[i].glyphIndexArray[code];
		if (glyphIndex) {
			return glyphIndex;
		}
	}
	return 0;
};

Font.prototype.getCodeAndGlyph = function () {


	var glyphs = [];


	var self = this;

	this.cmap.cmaps.forEach(function (item, index) {
		item.glyphIndexArray.forEach(function (glyphIndex, code) {
			glyphIndex = index + glyphIndex;
			var glyph = self.glyf.glyphs[glyphIndex];

			var char = toChar(code);
			var unicode = '&#x' + (code.toString(16)).toUpperCase() + ';';

			if (!!glyphIndex && !!glyph && char) {
				glyphs.push({
					name: char,
					unicode: unicode,
					boundingBox: glyph.boundingBox,
					path: glyph.toSVGPath()
				});
			}
		});
	});

	return glyphs;

};

function toUTF16(code) {
	var temp = code.toString(16).toUpperCase();
	return "\\u" + new Array(5 - String(temp).length).join('0') + temp;
}

function toChar(code) {
	var char = String.fromCharCode(code);

	var arr = ['"', '<', '>', '&'];
	var arr2 = ['&quot;', '&lt;', '&gt;', '&amp;'];

	var idx = arr.indexOf(char);

	if (idx > -1) {
		return arr2[idx];
	}

	return char;
}

function toNumber(code) {
	var temp = code.toString(16).toUpperCase();
	return "&#x" + new Array(5 - String(temp).length).join('0') + temp + ';';
}


Font.prototype.getHmtxForChar = function (index) {
	if (this.post.isFixedPitch) {
		return this.hmtx.longHorMetric[0];
	} else {
		return this.hmtx.longHorMetric[index];
	}
};

Font.prototype.getKernForPair = function (left, right) {
	if (this.kern && (left !== undefined) && (right !== undefined)) {
		var tables = this.kern.nTables;
		for (var i = 0; i < tables; i++) {
			var kern = this.kern.tables[i];
			switch (kern.coverage & 0x00ff) {
				case 0:
					var key = ((left & 0xffff) << 16) | (right & 0xffff);
					return kern.pairs[key] || 0;
					break;
				case 2:
					var leftOffset = 0;
					if (left >= kern.leftOffsetTable.firstGlyph) {
						leftOffset = kern.leftOffsetTable.offsets[left - kern.leftOffsetTable.firstGlyph];
					}
					var rightOffset = 0;
					if (right >= kern.rightOffsetTable.firstGlyph) {
						rightOffset = kern.rightOffsetTable.offsets[right - kern.rightOffsetTable.firstGlyph];
					}
					var combinedOffset = leftOffset + rightOffset;
					this.stream.goto(kern.start + combinedOffset);
					return this.stream.getInt16();
					break;
				case 4:
					break;
			}
		}
	}
	return 0;
};

Font.prototype.getTextAsGlyphIds = function (text) {
	var glyphIds = new Array(text.length);
	for (var i = 0; i < text.length; i++) {
		glyphIds[i] = this.getGlyphIndexForCharacterCode(text[i]);
	}
	return glyphIds;
};

