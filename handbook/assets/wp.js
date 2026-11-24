// 把屏内 [data-m] 元素的编号画在手机左缘、与元素垂直居中对齐（支持一页多部手机）
(function(){
  function drawOne(ph){
    var phone=ph.querySelector('.phone'); if(!phone) return;
    ph.querySelectorAll('.wp-mk').forEach(function(e){e.remove();});
    var pr=ph.getBoundingClientRect(), fr=phone.getBoundingClientRect();
    var sc=pr.width/ph.offsetWidth||1;
    ph.querySelectorAll('[data-m]').forEach(function(el){
      var r=el.getBoundingClientRect(), m=document.createElement('div');
      m.className='wp-mk'; m.textContent=el.getAttribute('data-m');
      m.style.left=((fr.left-pr.left)/sc)+'px';
      m.style.top=((r.top+r.height/2-pr.top)/sc)+'px';
      ph.appendChild(m);
    });
  }
  function draw(){ document.querySelectorAll('.wp-ph').forEach(drawOne); }
  draw(); window.addEventListener('load',draw); window.addEventListener('resize',draw);
})();
