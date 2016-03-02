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

      <% if(!hasX){ %>
      <glyph glyph-name="x" unicode="&#x78;" horiz-adv-x="100"
        d="M20 20 L50 20 L50 -20 Z" />
      <% } %>

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
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" <% if(!options['skipViewport']){ %>  x="0" y="0"   width="<%= options['width'] %>" height="<%= options['height'] %>" <% } %> viewBox="0 0 <%= glyph['horizAdvX'] %> <%= glyph['vertAdvY'] %>">
  <path d="<%= glyph['d'] %>"/>
  </svg>
*/
})