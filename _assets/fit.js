/* 预览自适应：把 1360×765 画布等比缩放到当前窗口内并居中，任何窗口大小都能看到整页。
   窗口正好 1360×765 时缩放为 1，不影响导出截图。 */
(function () {
  var W = 1360, H = 765, d = document.documentElement, b = document.body;
  function fit() {
    var vw = window.innerWidth, vh = window.innerHeight, s = Math.min(vw / W, vh / H);
    d.style.cssText += ';width:' + vw + 'px;height:' + vh + 'px;overflow:hidden;background:#D9DFEA;';
    b.style.cssText += ';margin:0;position:absolute;width:' + W + 'px;height:' + H + 'px;' +
      'left:' + (vw - W * s) / 2 + 'px;top:' + (vh - H * s) / 2 + 'px;' +
      'transform-origin:0 0;transform:scale(' + s + ');overflow:hidden;';
  }
  fit();
  window.addEventListener('resize', fit);
})();
