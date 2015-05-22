var StreamReader = require('../lib/StreamReader');
var Font = require('../lib/Font');
var initializers = require('../lib/initializers');

module.exports = ttf;


function ttf(buffer) {

	var slr = new StreamReader(toArrayBuffer(buffer));
	var font = new Font(slr);
	font.version = slr.getUint32();
	if (font.version !== 0x74727565 && font.version !== 0x00010000) {
		throw "This is not a valid TrueType font, according to the spec."
	}
	var numberOfTables = slr.getUint16();
	var searchRange = slr.getUint16();
	var entrySelector = slr.getUint16();
	var rangeShift = slr.getUint16();

	for (var i = 0; i < numberOfTables; i++) {
		var table = readTableDirectory(slr);
		font.tables.push(table);
	}
	initializers['name'](font);

	font.initTables();

	return font;
}

function toArrayBuffer(buffer) {
	var ab = new ArrayBuffer(buffer.length);
	var view = new Uint8Array(ab);
	for (var i = 0; i < buffer.length; ++i) {
		view[i] = buffer[i];
	}
	return ab;
}


function readTableDirectory(slr) {
	var ret = {};
	ret.tag = slr.readString(4);
	ret.crc = slr.getUint32();
	ret.offset = slr.getUint32();
	ret.len = slr.getUint32();
	return ret;
}


