/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">'
        + '<foreignObject width="100%" height="100%">'
        + '<div id="emojiSentDiv" class="emojiRender">'
        + '<img class="emoji removeEmoji" width="30" height="30" align="absmiddle" src="images/emojis/tongue.png" alt="tongue" title="tongue"> <img class="emoji removeEmoji" width="30" height="30" align="absmiddle" src="images/emojis/unamused.png" alt="unamused" title="unamused"> <img class="emoji removeEmoji" width="30" height="30" align="absmiddle" src="images/emojis/relieved.png" alt="relieved" title="relieved"> <img class="emoji removeEmoji" width="30" height="30" align="absmiddle" src="images/emojis/satisfied.png" alt="satisfied" title="satisfied">'
        + '</div>'
        + '</foreignObject></svg>';

var DOMURL = window.URL || window.webkitURL || window;

var img = new Image();
var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
var url = DOMURL.createObjectURL(svg);

img.onload = function () {
  ctx.drawImage(img, 0, 0);
  DOMURL.revokeObjectURL(url);
};

img.src = url;