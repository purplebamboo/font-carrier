var multiline = require('multiline')

exports.FONT_TMPL = multiline(function(){/*!

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
    <% for(var i in glyphs){
      var glyph = glyphs[i].options;
     %>
    <glyph glyph-name="<%= glyph['glyphName'] %>" unicode="&#x<%= glyph['unicode']%>;" d="<%= glyph['d']%>"  <% if (glyph['horizAdvX']) print('horiz-adv-x="'+ glyph['horizAdvX']+'"') %> <% if (glyph['vertAdvY']) print('vert-adv-y="'+ glyph['vertAdvY']+'"') %>  />

    <% } %>

  </font>
</defs></svg>
*/})


exports.SVG_TMPL = multiline(function(){/*!
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" width="<%= glyph['horizAdvX'] %>" height="<%= glyph['vertAdvY'] %>" viewBox="0 0 <%= glyph['horizAdvX'] %> <%= glyph['vertAdvY'] %>" xml:space="preserve">
  <path d="<%= glyph['d'] %>"/>
</svg>
*/})
