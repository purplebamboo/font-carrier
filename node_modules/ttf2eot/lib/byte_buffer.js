//
// Light version of byte buffer
//

'use strict';

// wraps and reuses buffer, possibly cropped (offset, length)
var ByteBuffer = function (buffer, start, length) {
  /*jshint bitwise:false*/

  var isByteBuffer = buffer.start !== undefined; // is buffer of type ByteBuffer?
  this.buffer = isByteBuffer ? buffer.buffer : buffer;
  this.start = (start || 0) + (isByteBuffer ? buffer.start : 0);
  this.length = length !== undefined ? length : (this.buffer.length - this.start);
  this.offset = 0;

  // get current position
  //
  this.tell = function() {
    return this.offset;
  };

  // set current position
  //
  this.seek = function(pos) {
    this.offset = pos;
  };

  this.fill = function(value) {
    var index = this.byteLength - 1;
    while (index >= 0) {
      this.buffer[index + this.start] = value;
      index--;
    }
  };

  this.getUint8 = function(pos) {
    return this.buffer[pos + this.start];
  };

  this.getUint16 = function(pos, littleEndian) {
    if (littleEndian) {
      return this._getUint16LE(pos);
    } else {
      return this._getUint16BE(pos);
    }
  };

  this.getUint32 = function(pos, littleEndian) {
    if (littleEndian) {
      return this._getUint32LE(pos);
    } else {
      return this._getUint32BE(pos);
    }
  };

  this.setUint8 = function(pos, value) {
    this.offset = pos;
    this.writeUint8(value);
  };

  this.setUint16 = function(pos, value, littleEndian) {
    if (littleEndian) {
      return this._setUint16LE(pos, value);
    } else {
      return this._setUint16BE(pos, value);
    }
  };

  this.setUint32 = function(pos, value, littleEndian) {
    if (littleEndian) {
      return this._setUint32LE(pos, value);
    } else {
      return this._setUint32BE(pos, value);
    }
  };

  this.writeUint8 = function(value) {
    this.buffer[this.offset + this.start] = value & 0xFF;
    this.offset++;
  };

  this.writeInt8 = function(value) {
    this.writeUint8((value < 0) ? 0xFF + value + 1 : value);
  };

  this.writeUint16 = function(value, littleEndian) {
    if (littleEndian) {
      return this._writeUint16LE(value);
    } else {
      return this._writeUint16BE(value);
    }
  };

  this.writeInt16 = function(value) {
    this.writeUint16((value < 0) ? 0xFFFF + value + 1 : value);
  };


  this.writeUint32 = function(value, littleEndian) {
    if (littleEndian) {
      return this._writeUint32LE(value);
    } else {
      return this._writeUint32BE(value);
    }
  };

  this.writeInt32 = function(value) {
    this.writeUint32((value < 0) ? 0xFFFFFFFF + value + 1 : value);
  };

  this.writeUint64 = function(value) {
    // we canot use bitwise operations for 64bit values because of JavaScript limitations,
    // instead we should divide it to 2 Int32 numbers
    // 2^32 = 4294967296
    var hi = Math.floor(value / 4294967296);
    var lo = value - hi * 4294967296;
    this.writeUint32(hi);
    this.writeUint32(lo);
  };

  this.writeBytes = function(data) {
    var buffer = this.buffer;
    var offset = this.offset + this.start;
    for (var i = 0; i < data.length; i++) {
      buffer[i + offset] = data[i];
    }
    this.offset += data.length;
  };

  this.toString = function(start, end) {
    var string = "";
    for (var i = start; i < end; i++) {
      string += String.fromCharCode(this.buffer[i + this.start]);
    }
    return string;
  };

  // private methods

  this._getUint16BE = function(pos) {
    var val = this.buffer[pos + 1 + this.start];
    val = val + (this.buffer[pos + this.start] << 8 >>> 0);
    return val;
  };

  this._getUint32BE = function(pos) {
    var val = this.buffer[pos + 1 + this.start] << 16;
    val |= this.buffer[pos + 2 + this.start] << 8;
    val |= this.buffer[pos + 3 + this.start];
    val = val + (this.buffer[pos + this.start] << 24 >>> 0);
    return val;
  };

  this._setUint16LE = function(pos, value) {
    this.offset = pos;
    this._writeUint16LE(value);
  };

  this._setUint32BE = function(pos, value) {
    this.offset = pos;
    this.writeUint32(value);
  };

  this._setUint32LE = function(pos, value) {
    this.offset = pos;
    this._writeUint32LE(value);
  };

  this._writeUint16BE = function(value) {
    this.buffer[this.offset + this.start] = (value >>> 8) & 0xFF;
    this.buffer[this.offset + 1 + this.start] = value & 0xFF;
    this.offset += 2;
  };

  this._writeUint16LE = function(value) {
    this.buffer[this.offset + this.start] = value & 0xFF;
    this.buffer[this.offset + 1 + this.start] = (value >>> 8) & 0xFF;
    this.offset += 2;
  };

  this._writeUint32BE = function(value) {
    this.buffer[this.offset + this.start] = (value >>> 24) & 0xFF;
    this.buffer[this.offset + 1 + this.start] = (value >>> 16) & 0xFF;
    this.buffer[this.offset + 2 + this.start] = (value >>> 8) & 0xFF;
    this.buffer[this.offset + 3 + this.start] = value & 0xFF;
    this.offset += 4;
  };

  this._writeUint32LE = function(value) {
    this.buffer[this.offset + this.start] = value & 0xFF;
    this.buffer[this.offset + 1 + this.start] = (value >>> 8) & 0xFF;
    this.buffer[this.offset + 2 + this.start] = (value >>> 16) & 0xFF;
    this.buffer[this.offset + 3 + this.start] = (value >>> 24) & 0xFF;
    this.offset += 4;
  };
};

module.exports = ByteBuffer;
