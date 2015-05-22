
var macRomanEncoding =
	['.notdef', '.null', 'nonmarkingreturn', 'space', 'exclam', 'quotedbl', 'numbersign', 'dollar', 'percent', 'ampersand',
		'quotesingle', 'parenleft', 'parenright', 'asterisk', 'plus', 'comma', 'hyphen', 'period', 'slash', 'zero', 'one', 'two',
		'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'colon', 'semicolon', 'less', 'equal', 'greater', 'question', 'at',
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'bracketleft',
		'backslash', 'bracketright', 'asciicircum', 'underscore', 'grave', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
		'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'braceleft', 'bar', 'braceright', 'asciitilde', 'Adieresis', 'Aring',
		'Ccedilla', 'Eacute', 'Ntilde', 'Odieresis', 'Udieresis', 'aacute', 'agrave', 'acircumflex', 'adieresis', 'atilde', 'aring',
		'ccedilla', 'eacute', 'egrave', 'ecircumflex', 'edieresis', 'iacute', 'igrave', 'icircumflex', 'idieresis', 'ntilde', 'oacute',
		'ograve', 'ocircumflex', 'odieresis', 'otilde', 'uacute', 'ugrave', 'ucircumflex', 'udieresis', 'dagger', 'degree', 'cent',
		'sterling', 'section', 'bullet', 'paragraph', 'germandbls', 'registered', 'copyright', 'trademark', 'acute', 'dieresis',
		'notequal', 'AE', 'Oslash', 'infinity', 'plusminus', 'lessequal', 'greaterequal', 'yen', 'mu', 'partialdiff', 'summation',
		'product', 'pi', 'integral', 'ordfeminine', 'ordmasculine', 'Omega', 'ae', 'oslash', 'questiondown', 'exclamdown', 'logicalnot',
		'radical', 'florin', 'approxequal', 'Delta', 'guillemotleft', 'guillemotright', 'ellipsis', 'nonbreakingspace', 'Agrave', 'Atilde',
		'Otilde', 'OE', 'oe', 'endash', 'emdash', 'quotedblleft', 'quotedblright', 'quoteleft', 'quoteright', 'divide', 'lozenge', 'ydieresis',
		'Ydieresis', 'fraction', 'currency', 'guilsinglleft', 'guilsinglright', 'fi', 'fl', 'daggerdbl', 'periodcentered', 'quotesinglbase',
		'quotedblbase', 'perthousand', 'Acircumflex', 'Ecircumflex', 'Aacute', 'Edieresis', 'Egrave', 'Iacute', 'Icircumflex', 'Idieresis',
		'Igrave', 'Oacute', 'Ocircumflex', 'apple', 'Ograve', 'Uacute', 'Ucircumflex', 'Ugrave', 'dotlessi', 'circumflex', 'tilde', 'macron',
		'breve', 'dotaccent', 'ring', 'cedilla', 'hungarumlaut', 'ogonek', 'caron', 'Lslash', 'lslash', 'Scaron', 'scaron', 'Zcaron', 'zcaron',
		'brokenbar', 'Eth', 'eth', 'Yacute', 'yacute', 'Thorn', 'thorn', 'minus', 'multiply', 'onesuperior', 'twosuperior', 'threesuperior',
		'onehalf', 'onequarter', 'threequarters', 'franc', 'Gbreve', 'gbreve', 'Idotaccent', 'Scedilla', 'scedilla', 'Cacute', 'cacute',
		'Ccaron', 'ccaron', 'dcroat']; // minify *this*


function getTableByTag(font, tag) {
	var tb = font.tables.filter(function (tb) {
		return tb.tag === tag;
	});
	return tb ? tb[0] : undefined;
}

var Glyph = require('./Glyph');

module.exports = {
	'head': function (font) {
		var tb = getTableByTag(font, 'head');
		var slr = font.stream;
		slr.goto(tb.offset);
		var header = {};
		header.version = slr.get32Fixed();
		header.revision = slr.get32Fixed();
		header.checkSumAdjustment = slr.getUint32();
		header.magic = slr.getUint32();
		if (header.magic !== 0x5F0F3CF5) {
			throw "Font header has incorrect magic number";
		}
		header.flags = slr.getUint16();
		header.unitsPerEm = slr.getUint16();

		header.created = slr.getInt64();
		header.modified = slr.getInt64();

		header.xMin = slr.getInt16();
		header.yMin = slr.getInt16();
		header.xMax = slr.getInt16();
		header.yMax = slr.getInt16();

		header.macStyle = slr.getUint16();
		header.lowestRecPPEM = slr.getUint16();
		header.fontDirectionHint = slr.getInt16();
		header.indexToLocFormat = slr.getInt16();
		header.glyphDataFormat = slr.getInt16();

		font.head = Object.freeze(header);
	},
	'name': function (font) {
		var tb = getTableByTag(font, 'name');
		var slr = font.stream;
		slr.goto(tb.offset);
		var namesTable = { records: [] };
		namesTable.version = slr.getUint16();
		var count = slr.getUint16();
		var stringOffset = slr.getUint16();
		for (var i = 0; i < count; i++) {
			var record = {};
			record.platformID = slr.getUint16();
			record.platformSpecificID = slr.getUint16();
			record.language = slr.getUint16();
			record.nameID = slr.getUint16();
			var length = slr.getUint16();
			var offset = slr.getUint16();
			record.text = slr.getStringAt(tb.offset + stringOffset + offset, length);
			namesTable.records.push(record);
		}
		font.name = namesTable;
	},
	'hhea': function (font) {
		var tb = getTableByTag(font, 'hhea');
		var slr = font.stream;
		slr.goto(tb.offset);
		var hheader = {};
		hheader.version = slr.get32Fixed();
		hheader.ascender = slr.getInt16();
		hheader.descender = slr.getInt16();

		hheader.lineGap = slr.getInt16();
		hheader.advanceWidthMax = slr.getUint16();
		hheader.minLeftSideBearing = slr.getInt16();
		hheader.minRightSideBearing = slr.getInt16();
		hheader.xMaxExtent = slr.getInt16();
		hheader.caretSlopeRise = slr.getInt16();
		hheader.caretSlopeRun = slr.getInt16();
		hheader.reserved1 = slr.getInt16();
		hheader.reserved2 = slr.getInt16();
		hheader.reserved3 = slr.getInt16();
		hheader.reserved4 = slr.getInt16();
		hheader.reserved5 = slr.getInt16();
		hheader.metricDataFormat = slr.getInt16();
		hheader.numberOfHMetrics = slr.getUint16();

		font.hhea = Object.freeze(hheader);
	},
	'maxp': function (font) {
		var tb = getTableByTag(font, 'maxp');
		var slr = font.stream;
		slr.goto(tb.offset);
		var maxp = {};
		maxp.version = slr.get32Fixed();

		maxp.numGlyphs = slr.getInt16();
		maxp.maxPoints = slr.getInt16();
		maxp.maxContours = slr.getInt16();
		maxp.maxComponentPoints = slr.getInt16();
		maxp.maxComponentContours = slr.getInt16();
		maxp.maxZones = slr.getInt16();
		maxp.maxTwilightPoints = slr.getInt16();
		maxp.maxStorage = slr.getInt16();
		maxp.maxFunctionDefs = slr.getInt16();
		maxp.maxInstructionDefs = slr.getInt16();
		maxp.maxStackElements = slr.getInt16();
		maxp.maxSizeOfInstructions = slr.getInt16();
		maxp.maxComponentElements = slr.getInt16();
		maxp.maxComponentDepth = slr.getInt16();

		font.maxp = Object.freeze(maxp);
	},
	'post': function (font) {
		var tb = getTableByTag(font, 'post');
		var slr = font.stream;
		slr.goto(tb.offset);
		var post = {};
		post.format = slr.get32Fixed();
		post.italicAngle = slr.get32Fixed();
		post.underlinePosition = slr.getInt16();
		post.underlineThickness = slr.getInt16();
		post.isFixedPitch = slr.getUint32();
		post.minMemType42 = slr.getUint32();
		post.maxMemType42 = slr.getUint32();
		post.minMemType1 = slr.getUint32();
		post.maxMemType1 = slr.getUint32();

		var glyphNames = [], i;
		if (post.format === 1.0) {
			for (i = 0; i < 258; i++) {
				glyphNames[i] = macRomanEncoding[i];
			}
		} else if (post.format === 2.0) {
			var numGlyphs = slr.getUint16();
			var glyphNameIndex = new Array(numGlyphs);
			var maxIndex = Number.MIN_VALUE;
			for (i = 0; i < numGlyphs; i++) {
				var index = slr.getUint16();
				glyphNameIndex[i] = index;
				maxIndex = Math.max(maxIndex, index);
			}
			var nameArray = [];
			if (maxIndex >= 258) {
				for (i = 0; i < maxIndex - 258 + 1; i++) {
					var len = slr.getUint8();
					nameArray[i] = slr.readString(len);
				}
			}
			for (i = 0; i < numGlyphs; i++) {
				var index = glyphNameIndex[i];
				if (index < 258) {
					glyphNames[i] = macRomanEncoding[i];
				} else if (index >= 258 && index <= 32767) {
					glyphNames[i] = nameArray[index - 258];
				} else {
					throw "Unknow glyph name: " + index;
				}
			}
		}
		post.glyphNames = glyphNames;
		font.post = Object.freeze(post);
	},
	'loca': function (font) {
		var tb = getTableByTag(font, 'loca');
		var slr = font.stream;
		slr.goto(tb.offset);
		var loca = {};

		var indexToLocFormat = font.head.indexToLocFormat;
		var numGlyphs = font.maxp.numGlyphs;

		loca.offsets = new Array(numGlyphs + 1);
		for (var i = 0; i < numGlyphs + 1; i++) {
			if (indexToLocFormat === 0) {
				loca.offsets[i] = slr.getUint16() * 2;
			} else if (indexToLocFormat === 1) {
				loca.offsets[i] = slr.getUint32();
			} else {
				throw "Font contains invalid glyph IndexToLocFormat";
			}
		}
		font.loca = Object.freeze(loca);
	},
	'cmap': function (font) {
		var tb = getTableByTag(font, 'cmap');
		var slr = font.stream;
		slr.goto(tb.offset);
		var cmapTable = {};
		var version = slr.getUint16();
		var numberOfTables = slr.getUint16();
		var cmaps = new Array(numberOfTables);
		var cmap, i;
		for (i = 0; i < numberOfTables; i++) {
			cmap = {};
			cmap.platformID = slr.getUint16();
			cmap.platformSpecificID = slr.getUint16();
			cmap.offset = slr.getUint32();
			cmaps[i] = cmap;
		}
		for (i = 0; i < numberOfTables; i++) {
			cmap = cmaps[i];
			slr.goto(tb.offset + cmap.offset);
			cmap.format = slr.getUint16();
			cmap.length = slr.getUint16();
			cmap.language = slr.getUint16();
			cmap.glyphIndexArray = new Array(256);
			switch (cmap.format) {
				case 0:
					for (var j = 0; j < 256; j++) {
						cmap.glyphIndexArray[j] = slr.getUint8();
					}
					break;
				case 4:
					var numGlyphs = font.maxp.numGlyphs;

					var segCountX2 = slr.getUint16();
					var segCount = segCountX2 / 2;
					var searchRange = slr.getUint16();
					var entrySelector = slr.getUint16();
					var rangeShift = slr.getUint16();
					var endCode = slr.getUint16Array(segCount);
					slr.getUint16();  //reserved Pad
					var startCode = slr.getUint16Array(segCount);
					var idDelta = slr.getUint16Array(segCount);
					var idRangeOffset = slr.getUint16Array(segCount);
					var glyphToCharacterMap = new Array(numGlyphs);
					var curPos = slr.offset();
					for (var j = 0; j < segCount; j++) {
						var start = startCode[j];
						var end = endCode[j];
						var delta = idDelta[j];
						var rangeOffset = idRangeOffset[j];
						if (start !== 0xFFFF && end !== 0xFFFF) {
							for (var k = start; k <= end; k++) {
								if (rangeOffset === 0) {
									glyphToCharacterMap[((k + delta) % 65536)] = k;
									cmap.glyphIndexArray[k] = ((k + delta) % 65536);
								} else {
									var glyphOffset = curPos + ((rangeOffset / 2) + (k - start) + (i - segCount)) * 2;
									slr.goto(glyphOffset);
									var glyphIndex = slr.getUint16();
									if (glyphIndex != 0) {
										glyphIndex += delta;
										glyphIndex %= 65536;
										if (glyphToCharacterMap[glyphIndex] === 0) {
											glyphToCharacterMap[glyphIndex] = k;
											cmap.glyphIndexArray[k] = glyphIndex;
										}
									}
								}
							}
						}
					}
					cmap.glyphToCharacterMap = glyphToCharacterMap;
					break;
			}
		}
		cmapTable.cmaps = cmaps;
		font.cmap = Object.freeze(cmapTable);
	},
	'glyf': function (font) {
		var tb = getTableByTag(font, 'glyf');
		var slr = font.stream;
		slr.goto(tb.offset);
		var glyf = {};

		var maxp = font.maxp;
		var loca = font.loca;
		var post = font.post;

		var offsets = loca.offsets;
		var numGlyphs = maxp.numGlyphs;
		var glyphNames = post.glyphNames;

		var glyphs = new Array(numGlyphs);
		for (var i = 0; i < numGlyphs; i++) {
			if (offsets[i] === offsets[i + 1]) {
				continue;
			}
			var glyph = new Glyph(tb.offset + offsets[i], slr);
			glyphs[i] = glyph;
		}
		for (var i = 0; i < numGlyphs; i++) {
			if (glyphs[i] && glyphs[i].numberOfContours === -1) {
				glyphs[i].resolve(glyphs);
			}
		}
		glyf.glyphs = glyphs;
		font.glyf = Object.freeze(glyf);
	},
	'hmtx': function (font) {
		var tb = getTableByTag(font, 'hmtx');
		var slr = font.stream;
		slr.goto(tb.offset);
		var hmetrics = {};

		var numOfLongHorMetrics = font.hhea.numberOfHMetrics;
		hmetrics.longHorMetric = new Array(numOfLongHorMetrics);
		var i;
		for (i = 0; i < numOfLongHorMetrics; i++) {
			var metric = {};
			metric.advanceWidth = slr.getUint16();
			metric.leftSideBearing = slr.getInt16();
			hmetrics.longHorMetric[i] = metric;
		}
		var advanceWidth = hmetrics.longHorMetric[i - 1].advanceWidth;
		for (; i < font.maxp.numGlyphs; i++) {
			var metric = {};
			metric.advanceWidth = advanceWidth;
			metric.leftSideBearing = slr.getInt16();
			hmetrics.longHorMetric[i] = metric;
		}
		font.hmtx = Object.freeze(hmetrics);
	},
	'kern': function (font) {
		var tb = getTableByTag(font, 'kern');
		if (!tb) {
			return;
		}
		var slr = font.stream;
		slr.goto(tb.offset);
		var kerning = {};

		var fword1 = slr.getUint16();
		var fword2 = slr.getUint16();
		if (fword1 === 1 && fword2 === 0) {
			kerning.version = 1.0;
			kerning.nTables = slr.getUint32();
		} else {
			kerning.version = fword1;
			kerning.nTables = fword2;
		}
		kerning.tables = new Array(kerning.nTables);
		for (var i = 0; i < kerning.nTables; i++) {
			var kern = {};
			kern.start = slr.offset();
			kern.length = slr.getUint32();
			kern.coverage = slr.getUint16();
			kern.tupleIndex = slr.getUint16();
			switch (kern.coverage & 0x00ff) {
				case 0:
					// step 1: ignore these
					var nPairs = slr.getUint16();
					var searchRange = slr.getUint16();
					var entrySelector = slr.getUint16();
					var rangeShift = slr.getUint16();
					kern.pairs = {};
					for (var j = 0; j < kern.nPairs; j++) {
						// step 2: remember that native code can search faster
						var key = slr.getUint32();
						var value = slr.getInt16();
						kern.pairs[key] = value;
					}
					break;
				case 2:
					var rowWidth = slr.getUint16();
					var leftOffsetTable = slr.getUint16();
					var rightOffsetTable = slr.getUint16();
					var array = slr.getUint16();

					slr.goto(kern.start + leftOffsetTable);
					kern.leftOffsetTable = loadKernF2OffsetTable(slr);
					slr.goto(kern.start + rightOffsetTable);
					kern.rightOffsetTable = loadKernF2OffsetTable(slr);
					break;
			}
			kerning.tables[i] = kern;
		}
		font.kern = Object.freeze(kerning);
	}
};


function loadKernF2OffsetTable(slr) {
	var table = {};
	table.firstGlyph = slr.getUint16();
	var nGlyphs = slr.getUint16();
	table.offsets = slr.getUint16Array(nGlyphs);
	return table;
}