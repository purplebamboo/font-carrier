// just copy from https://github.com/ynakajima/ttf.js/blob/master/src/ttf.js

var ttf = require('./ttf');
var _ = require('lodash');


module.exports = TTF2SVG;

function TTF2SVG(file) {

	this.file = file;
	this.glyphs = [];
	this.meta = null;

	this._init();

}

TTF2SVG.prototype._init = function () {

	var font = ttf(this.file);

	this.meta = font.getMeta();

	this.meta.head = font.head;
	this.meta.hhea = font.hhea;

	this.glyphs = font.getCodeAndGlyph(0);

};

TTF2SVG.prototype.renderByTmpl = function (tmpl) {
	return  _.template(tmpl, {
		meta: this.meta,
		glyphs: this.glyphs
	});
};