var multiline = require('multiline')

//导出svg的配置
exports.DEFAULT_EXPORT_OPTIONS = {
  width: '100px',
  height: '100px',
}

//path 保留小数位
exports.PATH_DECIMAL = 4

exports.FONT_FAMILY = 'iconfont'


//默认的配置参数
exports.DEFAULT_OPTIONS = {
  font: {
    id: this.FONT_FAMILY,
    horizAdvX: 1024,
    vertAdvY: 1024
      // horizOriginX: null,
      // horizOriginY: null,
      // vertOriginX: null,
      // vertOriginY: null
  },
  fontface: {
    fontFamily: this.FONT_FAMILY,
    fontWeight: '400',
    fontStretch: 'normal',
    unitsPerEm: '1024',
    ascent: '812',
    descent: '-212'
  },
  glyph: {
    unicode: '',
    glyphName: '',
    d: '',
    horizAdvX: 1024,
    vertAdvY: 1024
  }
}



exports.FONT_TMPL = multiline(function() {/*!
<?xml version="1.0" standalone="no"?>
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >
  <svg>
  <metadata>
  Created by font-carrier
  </metadata>
  <defs>
  <font id="<%= font.id %>" horiz-adv-x="<%= font.horizAdvX %>" vert-adv-y="<%= font.horizAdvX %>" >
    <font-face
      <% for(var v in fontface){ %>
      <% print(v + '="' + fontface[v] + '"') %>
      <%} %>
    />
      <missing-glyph />
      <glyph glyph-name="x" unicode="x" horiz-adv-x="1001"
        d="M281 543q-27 -1 -53 -1h-83q-18 0 -36.5 -6t-32.5 -18.5t-23 -32t-9 -45.5v-76h912v41q0 16 -0.5 30t-0.5 18q0 13 -5 29t-17 29.5t-31.5 22.5t-49.5 9h-133v-97h-438v97zM955 310v-52q0 -23 0.5 -52t0.5 -58t-10.5 -47.5t-26 -30t-33 -16t-31.5 -4.5q-14 -1 -29.5 -0.5
        t-29.5 0.5h-32l-45 128h-439l-44 -128h-29h-34q-20 0 -45 1q-25 0 -41 9.5t-25.5 23t-13.5 29.5t-4 30v167h911zM163 247q-12 0 -21 -8.5t-9 -21.5t9 -21.5t21 -8.5q13 0 22 8.5t9 21.5t-9 21.5t-22 8.5zM316 123q-8 -26 -14 -48q-5 -19 -10.5 -37t-7.5 -25t-3 -15t1 -14.5
        t9.5 -10.5t21.5 -4h37h67h81h80h64h36q23 0 34 12t2 38q-5 13 -9.5 30.5t-9.5 34.5q-5 19 -11 39h-368zM336 498v228q0 11 2.5 23t10 21.5t20.5 15.5t34 6h188q31 0 51.5 -14.5t20.5 -52.5v-227h-327z" />
      <% for(var i in glyphs){
        var glyph = glyphs[i].options;
       %>
      <glyph glyph-name="<%= glyph['glyphName'] %>" unicode="<%= glyph['unicode']%>" d="<%= glyph['d']%>"  <% if (glyph['horizAdvX']) print('horiz-adv-x="'+ glyph['horizAdvX']+'"') %> <% if (glyph['vertAdvY']) print('vert-adv-y="'+ glyph['vertAdvY']+'"') %>  />

      <% } %>

  </font>
  </defs>
</svg>
*/
})


exports.SVG_TMPL = multiline(function() {/*!
<?xml version="1.0" encoding="utf-8"?>
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" width="<%= options['width'] %>" height="<%= options['height'] %>" viewBox="0 0 <%= glyph['horizAdvX'] %> <%= glyph['vertAdvY'] %>">
  <path d="<%= glyph['d'] %>"/>
  </svg>
*/
})