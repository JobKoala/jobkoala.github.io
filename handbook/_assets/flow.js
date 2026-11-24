/* auto-routed orthogonal connectors for the page-structure slides */
(function(){
  const GAP = 5;

  function anchor(r, side, base, off){
    off = off || 0;
    const x = r.left - base.left, y = r.top - base.top;
    const cx = x + r.width/2 + r.width*off, cy = y + r.height/2 + r.height*off;
    switch(side){
      case 'top':    return {x:cx, y:y};
      case 'bottom': return {x:cx, y:y + r.height};
      case 'left':   return {x:x, y:cy};
      case 'right':  return {x:x + r.width, y:cy};
    }
  }

  function route(a, b, fs, ts, via){
    const p = [[a.x, a.y]];
    const vert = s => s === 'top' || s === 'bottom';
    if (vert(fs) && vert(ts)){
      const m = via != null ? via : (fs === ts ? Math.max(a.y, b.y) + 40 : (a.y + b.y)/2);
      p.push([a.x, m], [b.x, m], [b.x, b.y]);
    } else if (!vert(fs) && !vert(ts)){
      const m = via != null ? via : (fs === ts ? Math.max(a.x, b.x) + 40 : (a.x + b.x)/2);
      p.push([m, a.y], [m, b.y], [b.x, b.y]);
    } else if (!vert(fs) && vert(ts)){
      p.push([b.x, a.y], [b.x, b.y]);
    } else {
      p.push([a.x, b.y], [b.x, b.y]);
    }
    return p;
  }

  function dedupe(p){
    const out = [p[0]];
    for (let i=1;i<p.length;i++){
      const q = p[i], l = out[out.length-1];
      if (Math.abs(q[0]-l[0]) > 1.5 || Math.abs(q[1]-l[1]) > 1.5) out.push(q);
    }
    return out;
  }

  function trimLast(p){
    const n = p.length;
    const [x1,y1] = p[n-2], [x2,y2] = p[n-1];
    const dx = x2-x1, dy = y2-y1, len = Math.hypot(dx,dy) || 1;
    p[n-1] = [x2 - dx/len*GAP, y2 - dy/len*GAP];
    return p;
  }

  function rounded(p, r){
    if (p.length < 3) return 'M' + p.map(q => q[0].toFixed(1)+','+q[1].toFixed(1)).join(' L');
    let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
    for (let i=1;i<p.length-1;i++){
      const prev = p[i-1], cur = p[i], next = p[i+1];
      const d1 = Math.hypot(cur[0]-prev[0], cur[1]-prev[1]);
      const d2 = Math.hypot(next[0]-cur[0], next[1]-cur[1]);
      const rr = Math.min(r, d1/2, d2/2);
      const p1 = [cur[0] + (prev[0]-cur[0])/d1*rr, cur[1] + (prev[1]-cur[1])/d1*rr];
      const p2 = [cur[0] + (next[0]-cur[0])/d2*rr, cur[1] + (next[1]-cur[1])/d2*rr];
      d += ` L${p1[0].toFixed(1)},${p1[1].toFixed(1)} Q${cur[0].toFixed(1)},${cur[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    const last = p[p.length-1];
    d += ` L${last[0].toFixed(1)},${last[1].toFixed(1)}`;
    return d;
  }

  function labelAt(p){
    let best = 0, bx = p[0][0], by = p[0][1];
    for (let i=0;i<p.length-1;i++){
      const d = Math.hypot(p[i+1][0]-p[i][0], p[i+1][1]-p[i][1]);
      if (d > best){ best = d; bx = (p[i][0]+p[i+1][0])/2; by = (p[i][1]+p[i+1][1])/2; }
    }
    return [bx, by];
  }

  window.drawWires = function(wires){
    const svg = document.querySelector('svg.wires');
    const base = document.body.getBoundingClientRect();
    const NS = 'http://www.w3.org/2000/svg';
    svg.innerHTML =
      '<defs>' +
      '<marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
      '<path d="M0,1 L9,5 L0,9 z" fill="#2E5BE0"/></marker>' +
      '<marker id="ahg" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
      '<path d="M0,1 L9,5 L0,9 z" fill="#9AAAD0"/></marker>' +
      '</defs>';

    wires.forEach(w => {
      const fe = document.getElementById(w.f), te = document.getElementById(w.t);
      if (!fe || !te){ console.warn('missing node', w.f, w.t); return; }
      const a = anchor(fe.getBoundingClientRect(), w.fs, base, w.fo);
      const b = anchor(te.getBoundingClientRect(), w.ts, base, w.to);
      // straighten: if the two anchors are nearly aligned, snap them and drop the mid-bend
      const vert = s => s === 'top' || s === 'bottom';
      let via = w.via, snapped = false;
      if (!vert(w.fs) && !vert(w.ts) && Math.abs(a.y - b.y) <= 34){ a.y = b.y; snapped = true; }
      if (vert(w.fs) && vert(w.ts) && Math.abs(a.x - b.x) <= 34){ a.x = b.x; snapped = true; }
      if (snapped) via = null;
      const pts = dedupe(route(a, b, w.fs, w.ts, via));
      trimLast(pts);
      const path = document.createElementNS(NS,'path');
      path.setAttribute('d', rounded(pts, 9));
      path.setAttribute('fill','none');
      path.setAttribute('stroke-linecap','round');
      if (w.tree){
        // hierarchy line: thin, no arrowhead, small dot where it meets the card
        path.setAttribute('stroke','#A9C1EA');
        path.setAttribute('stroke-width','1.5');
        svg.appendChild(path);
        const end = pts[pts.length-1];
        const dot = document.createElementNS(NS,'circle');
        dot.setAttribute('cx', end[0].toFixed(1));
        dot.setAttribute('cy', end[1].toFixed(1));
        dot.setAttribute('r','3');
        dot.setAttribute('fill','#4C7FE0');
        svg.appendChild(dot);
      } else {
        path.setAttribute('stroke', w.d ? '#9AAAD0' : '#2E5BE0');
        path.setAttribute('stroke-width', w.d ? '1.6' : '2');
        if (w.d) path.setAttribute('stroke-dasharray','4 4');
        path.setAttribute('marker-end', w.d ? 'url(#ahg)' : 'url(#ah)');
        svg.appendChild(path);
      }

      if (w.l){
        const [lx, ly] = (w.lx != null) ? [w.lx, w.ly] : labelAt(pts);
        const txt = document.createElementNS(NS,'text');
        txt.setAttribute('x', lx); txt.setAttribute('y', ly);
        txt.setAttribute('text-anchor','middle');
        txt.setAttribute('dominant-baseline','middle');
        txt.setAttribute('font-size','9.5');
        txt.setAttribute('font-weight','800');
        txt.setAttribute('fill', w.d ? '#8A93A3' : '#2E5BE0');
        txt.setAttribute('stroke','#F8FAFD');
        txt.setAttribute('stroke-width','3.4');
        txt.setAttribute('paint-order','stroke');
        txt.setAttribute('font-family','-apple-system,"SF Pro Text","Helvetica Neue",Arial,"PingFang SC",sans-serif');
        txt.textContent = w.l;
        svg.appendChild(txt);
      }
    });
  };
})();
