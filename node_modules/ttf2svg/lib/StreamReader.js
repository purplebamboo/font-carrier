module.exports = StreamReader;

function StreamReader(arrayBuffer, offset) {
	var i = offset || 0;
	var view = new DataView(arrayBuffer, i);
	// TODO: bounds checking
	this.getInt8 = function () {
		return view.getInt8(i++);
	};
	this.getUint8 = function () {
		return view.getUint8(i++);
	};
	this.getInt16 = function () {
		return i += 2, view.getInt16(i - 2);
	};
	this.getUint16 = function () {
		return i += 2, view.getUint16(i - 2);
	};
	this.getInt32 = function () {
		return i += 4, view.getInt32(i - 4);
	};
	this.getUint32 = function () {
		return i += 4, view.getUint32(i - 4);
	};
	this.getFloat32 = function () {
		return i += 4, view.getFloat32(i - 4);
	};
	this.getInt64 = function () {
		this.getInt32() << 32 | this.getInt32();
	}; //TODO: this is bollocks
	this.backup = function (bytes) {
		i -= bytes;
	};
	this.offset = function () {
		return i;
	};
	this.goto = function (l) {
		i = Math.max(l, 0);
	};

	this.readString = function (count) {
		var str = this.getStringAt(i, count);
		i += count;
		return str;
	};
	this.getStringAt = function (start, len) {
		var str = '';
		for (var k = 0; k < len; k++) {
			str += String.fromCharCode(view.getInt8(start + k));
		}
		return str;
	};
	this.get32Fixed = function () {
		var ret = 0.0;
		ret = this.getInt16();
		ret += (this.getInt16() / 65536);
		return ret;
	};
	this.getUint8Array = function (len) {
		var ret = [];
		for (var i = 0; i < len; i++) {
			ret[i] = this.getUint8();
		}
		return ret;
	};
	this.getUint16Array = function (len) {
		var ret = [];
		for (var i = 0; i < len; i++) {
			ret[i] = this.getUint16();
		}
		return ret;
	};
}