// Fuente única del popup INV: el generador la incorpora sin variantes en las cuatro entradas.
const InvPopup=(()=>{
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nf=n=>n==null?'—':(Math.round(n*10)/10).toLocaleString('es-CO');
const fe2=f=>f?f.slice(8,10)+'-'+f.slice(5,7):'sin fecha';
const INV_E={agot:['🔴','Agotado'],bajo:['🟠','Por agotarse'],noap:['⚪','No aparece / no codificado'],neg:['🟣','Error de inventario'],ok:['✅','Con inventario'],sd:['⚪','Sin reporte']};
const INV_O={agot:0,noap:1,neg:2,bajo:3,ok:4,sd:5};
const fecha=f=>Number(f.slice(8,10))+' '+['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][Number(f.slice(5,7))-1];
const hoy=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Bogota'}).format(new Date());
const codigo=x=>String(x??'').replace(/^0+/,'');
const coincide=(r,v)=>r[1].some(e=>codigo(e)===codigo(v.e))||!!v.plu&&[...String(r[2]+' '+(r[6]||'')).matchAll(/\bPLU\s*[:#]?\s*(\d+)/gi)].some(m=>codigo(m[1])===codigo(v.plu));
const periodo=(r,dia)=>dia<r[4]?fecha(r[4])+'–'+fecha(r[5]||r[4]):'hasta '+fecha(r[5]||r[4]);
function vigencias(v,a,dia){
 return (a.catalogo||[]).filter(r=>{
  const fin=r[5]||r[4];return /^\d{4}-\d\d-\d\d$/.test(r[4])&&fin>=dia&&
   ((r[4]<='2026-11-30'&&fin>='2026-11-01')||(r[4]<=dia&&fin>=dia))&&coincide(r,v)&&!/por confirmar/i.test(r[6]||'');
 });
}
function etiquetas(v,a,dia=hoy()){
 const tags=[],visibles=vigencias(v,a,dia);
 for(const r of visibles)tags.push({tipo:'dinamica',texto:'🏷️ '+(r[3]==null?r[2]:r[3]+' %')+' · '+periodo(r,dia)});
 for(const r of a.pendientes||[])if(coincide(r,v))tags.push({tipo:'confirmar',texto:'⚠️ '+(r[3]==null?r[2]:r[3]+' %')+' por confirmar'});
 const n=String(v.d||'');
 if(/\bOF(?:\.|\b)|\bPAGUE\b|\bLLEVE\b|\bDUOPACK\b|\bECONOPACK\b|%\s*(?:DE\s*)?DESCUENTO/i.test(n)){
  let texto;const pack=n.match(/PAGUE\s*(\d+)\s*LLEVE\s*(\d+)/i),pct=n.match(/([\d.,]+)\s*%/);
  if(pack)texto='Pague '+pack[1]+' lleve '+pack[2];
  else if(pct)texto=n.slice(0,pct.index).replace(/^\s*OF[.\s-]*/i,'').replace(/\s*-\s*$/,'').trim().toLowerCase().replace(/^./,c=>c.toUpperCase())+' '+pct[1]+' %';
  else texto=n.replace(/^\s*OF[.\s-]*/i,'').trim();
  tags.push({tipo:'oferta',texto:'🎁 '+texto+' · '+(visibles.length?[...new Set(visibles.map(r=>periodo(r,dia)))].join(' / '):'sin fecha')});
 }
 return tags.filter((t,i,L)=>L.findIndex(x=>x.texto===t.texto)===i);
}
const GRUPOS_DIN={
 vigente:'🏷️ Con dinámica y en tienda',
 proxima:'🏷️ Próximas de noviembre y en tienda',
 sinstock:'🏷️ Otras dinámicas u ofertas · revisar stock o vigencia',
 resto:'Otros productos'
};
const RANGO_DIN={vigente:0,proxima:1,sinstock:2,resto:3};
function ordenComercial(v,a,dia,tags){
 const vig=vigencias(v,a,dia),activas=vig.filter(r=>r[4]<=dia),proximas=vig.filter(r=>r[4]>dia&&r[4]>='2026-11-01'&&r[4]<='2026-11-30');
 // «Sin dato», no codificado y saldos negativos nunca prueban existencia en tienda.
 const conocido=!a.sd&&!['sd','noap'].includes(v.est)&&typeof v.q==='number'&&Number.isFinite(v.q),stock=conocido&&v.q>0;
 // Las ofertas del nombre/CEN cuentan para el orden aunque no traigan fecha.
 // «Por confirmar» no asciende; el tercer grupo conserva los badges sin inventar stock.
 const oferta=tags.some(t=>t.tipo==='oferta'),pendiente=tags.some(t=>t.tipo==='confirmar');
 const grupo=stock&&!pendiente&&(activas.length||oferta)?'vigente':stock&&!pendiente&&proximas.length?'proxima':tags.length?'sinstock':'resto';
 const aplicables=activas.length?activas:proximas;
 const descuento=Math.max(0,...aplicables.map(r=>Number(r[3])||0));
 const fin=aplicables.filter(r=>(Number(r[3])||0)===descuento).map(r=>r[5]||r[4]).sort()[0]||'9999-12-31';
 const prioridad=v.tp&&v.tp[2]?(v.tp[0]===2?1:v.tp[0]===1?2:3):3;
 return {grupo,prioridad,descuento,fin};
}
const ordenAnterior=(x,y)=>INV_O[x.est]-INV_O[y.est]||x.m.localeCompare(y.m)||x.d.localeCompare(y.d);
function compararDinamica(x,y){
 const a=x.orden,b=y.orden;
 return RANGO_DIN[a.grupo]-RANGO_DIN[b.grupo]||a.prioridad-b.prioridad||b.descuento-a.descuento||a.fin.localeCompare(b.fin)||ordenAnterior(x,y);
}
function preparar(a,dia=hoy()){return a.it.map(v=>{const tags=etiquetas(v,a,dia);return {...v,tags,din:tags.map(t=>t.texto).join(' | '),orden:ordenComercial(v,a,dia,tags)}})}

function crear(adaptador){
let IVP={p:null,ver:"todo",ord:"dinamica",mar:""},ultimo=[];
if(!document.getElementById("inv-popup-estilo")){const s=document.createElement("style");s.id="inv-popup-estilo";s.textContent="#invPop{position:fixed;inset:0;background:#0005;z-index:210;display:flex;align-items:center;justify-content:center;padding:14px}\n#invPop[hidden]{display:none}\n#invPop .ipin{background:#fff;border-radius:16px;width:100%;max-width:440px;max-height:78vh;display:flex;flex-direction:column;box-shadow:0 12px 34px #0004;overflow:hidden}\n#invPop .iph{display:flex;gap:8px;align-items:flex-start;padding:12px 12px 6px;border-bottom:1px solid var(--line)}\n#invPop .iph>div{flex:1}\n#invPop .iph b{font-size:15px}\n#invPop .iph small{display:block;font-size:11.5px;color:var(--mut);margin-top:2px}\n#invPop .r{color:#b45309}\n#invPop .ipx{border:0;background:#f1f5f9;border-radius:99px;width:30px;height:30px;font-size:15px;cursor:pointer}\n#invPop .ipf{display:flex;gap:5px;overflow-x:auto;padding:8px 10px 4px;scrollbar-width:none}\n#invPop .ipf button{flex:none;border:1px solid var(--line);background:#fff;border-radius:99px;padding:5px 9px;font-size:12px;white-space:nowrap}\n#invPop .ipf button.on{background:#4338ca;color:#fff;border-color:#4338ca}\n#invPop .ipo{display:flex;gap:6px;padding:2px 10px 8px}\n#invPop .ipo select{flex:1;font-size:12.5px;padding:5px;border-radius:8px;border:1px solid var(--line)}\n#invPop .iph,#invPop .ipf,#invPop .ipo,#invPop .ipdn{flex-shrink:0}\n#invPop .ipf button{min-height:32px}\n#invPop .ipl{overflow:auto;padding:0 8px 10px;flex:1;min-height:0}\n#invPop .ipin{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;display:block;max-height:88vh}\n#invPop .iph{position:sticky;top:0;background:#fff;z-index:3}\n#invPop .ipl{overflow:visible;flex:none;min-height:0}\n#invPop .ipgr{top:52px}\n#invPop .tpHoy{font-size:11.5px}\n#invPop .ipgr{position:sticky;top:0;background:#eef2ff;color:#3730a3;font-weight:700;font-size:12px;padding:5px 8px;margin:6px -4px 0;border-radius:6px;z-index:1}\n#invPop .ipgr small{font-weight:400;opacity:.8}\n#invPop .ipdn{margin:0 10px 6px;border:1px solid #fed7aa;background:#fff7ed;border-radius:10px;padding:6px 9px;font-size:12.5px}\n#invPop .ipdn summary{cursor:pointer;font-weight:700;color:#9a3412}\n#invPop .ipdk{padding:5px 0;border-top:1px dashed #fed7aa}\n#invPop .ipdk b{display:block;font-size:12px}\n#invPop .ipdk small{display:block;font-size:11px;color:#7c2d12}\n#invPop .ipr{display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--line);padding:7px 4px}\n#invPop .ipn{flex:1;min-width:0}\n#invPop .ipn b{font-size:12.5px;display:block}\n#invPop .ipn small{display:block;font-size:11px;color:var(--mut)}\n#invPop .ipd{color:#9a3412!important}\n#invPop .plu{color:#0f172a}\n#invPop .ipa{color:#4338ca!important}\n#invPop .ipq{display:flex;gap:4px}\n#invPop .ipq span{display:flex;flex-direction:column;align-items:center;background:#f8fafc;border-radius:8px;padding:3px 7px;min-width:44px}\n#invPop .ipq small{font-size:9.5px;color:var(--mut)}\n#invPop .ipq b{font-size:14px}\n#invPop .e-agot .ipq span:first-child{background:#fee2e2;color:#991b1b}\n#invPop .e-bajo .ipq span:first-child{background:#ffedd5;color:#9a3412}\n#invPop .e-neg .ipq span:first-child{background:#f3e8ff;color:#6b21a8}\n#invPop .tpBV{display:inline-block;margin:2px 0 2px 6px;border:0;border-radius:8px;padding:2px 9px;font-size:12px;font-weight:800;background:#eef2ff;color:#3730a3;cursor:pointer;font-family:inherit;box-shadow:0 1px 2px rgba(0,0,0,.12)}\n#invPop .tpBV.s2{background:linear-gradient(180deg,#fde68a,#f59e0b);color:#78350f}\n#invPop .tpBV.s1{background:#fed7aa;color:#7c2d12}\n#invPop .tpBV.no{opacity:.55}\n#invPop .tpBV i{font-family:Georgia,serif;font-weight:700;display:inline-block;width:14px;height:14px;line-height:14px;text-align:center;border-radius:50%;background:rgba(0,0,0,.14);font-size:10px}\n#invPop .tpBV.on{outline:2px solid #f59e0b}\n#invPop .tpSV{display:block;margin:5px 0 2px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:6px;padding:6px 8px;font-size:12.5px;line-height:1.35;font-weight:400}\n#invPop .tpSV span{display:block;margin:1px 0}\n#invPop .tpSV[hidden]{display:none}\n#invPop .tpHoy{display:block;margin-top:3px;font-size:12px;color:#7c2d12;font-weight:600}\n#invPop .tpRVd{background:#fffbeb;border:1.5px solid #f59e0b;border-radius:10px;padding:5px 10px;font-size:13px;margin:6px 0}\n#invPop .tpRVd summary{cursor:pointer;list-style:none}\n#invPop .tpRVd summary::-webkit-details-marker{display:none}\n#invPop .tpRVd summary small{color:#92400e;text-decoration:underline;margin-left:4px}\n#invPop .tpRVd[open] summary small{display:none}\n#invPop .tpRVd>div{margin-top:5px;font-size:12.5px;line-height:1.35}\n#invPop .tpRVd>div small{color:#6b7280}";document.head.appendChild(s)}
function invPop(p, keep) {
  const a=adaptador.modelo(p); if(!a)return;
  if(!keep||IVP.p!==p)IVP={p,ver:'todo',ord:'dinamica',mar:''};
  const it=preparar(a); ultimo=it;
  const VER = [['todo', 'Todos', () => true], ['agot', '🔴 Agotados', v => v.est === 'agot'], ['noap', '⚪ No codificados', v => v.est === 'noap'], ['din', '🏷️ Con dinámica', v => v.din], ['bajo', '🟠 Por agotarse', v => v.est === 'bajo'],
    ['neg', '🟣 Error', v => v.est === 'neg'], ['ok', '✅ Con inventario', v => v.est === 'ok'], ['pedir', '🏬 Hay en CEDI', v => v.est !== 'ok' && v.ce > 0], ['tp', '⭐ Tienda Perfecta', v => v.tp && v.tp[2]]];
  const ORD = { dinamica: compararDinamica, prio: ordenAnterior, marca: (x, y) => x.m.localeCompare(y.m) || x.d.localeCompare(y.d),
    mas: (x, y) => (y.q || 0) - (x.q || 0), menos: (x, y) => (x.q || 0) - (y.q || 0), cedi: (x, y) => (y.ce || 0) - (x.ce || 0) };
  const MAR = [...new Set(it.map(v => v.m).filter(Boolean))].sort();
  const vv = VER.find(x => x[0] === IVP.ver) || VER[0], L = it.filter(vv[2]).filter(v => !IVP.mar || v.m === IVP.mar).sort(ORD[IVP.ord] || ORD.prio);
  const nD = it.filter(v => v.din).length, nDF = it.filter(v => v.din && v.est !== 'ok' && v.est !== 'sd').length, uni = it.reduce((s, v) => s + (v.q > 0 ? v.q : 0), 0);
  let box = $('#invPop'); if (!box) { box = document.createElement('div'); box.id = 'invPop'; document.body.appendChild(box); }
  box.innerHTML = `<div class="ipin"><div class="iph"><div><b>${esc(a.n || p)}</b><small>${a.sd?'⚪ Sin reporte de inventario de la cadena':`📦 Inventario del ${esc(fe2(a.f))} (CEN ${esc(a.cad.toLowerCase())})${a.fa?' · antes '+esc(fe2(a.fa)):''} · lo surte ${esc(a.ce)}`}</small>
      <small>${a.sd?'Cantidades por verificar en la visita':nf(uni)+' unidades · surtido '+a.surt+'% ('+a.cr+' de '+a.ref+')'}${nD ? ` · 🏷️ ${nD} con dinámica u oferta${nDF ? ` · <b class="r">⚡ ${nDF} sin producto</b>` : ''}` : ''}</small></div><button type="button" class="ipx" data-ipx>✕</button></div>
    ${(() => { const t = a.tp; if (!t || !t.n) return ''; const f = t.n - t.ok; return `<details class="tpRVd"><summary>⭐ <b>Tienda Perfecta</b> ${t.ok}/${t.n}${f ? ` · <b class="r">faltan ${f}</b>${t.f2 ? ` (⭐⭐ ${t.f2})` : ''}` : ' ✅'} <small>ver</small>${(() => { const F = it.filter(v => v.tp && v.tp[2] && v.est !== 'ok' && v.est !== 'bajo').sort((x, y) => y.tp[0] - x.tp[0] || x.tp[1] - y.tp[1]).slice(0, 3); return F.length ? `<span class="tpHoy">🎯 Hoy prioriza: ${F.map(v => `${esc(v.d)} (${v.tp[0] === 2 ? '⭐⭐' : v.tp[0] === 1 ? '⭐' : '🏪'} ${v.est === 'noap' ? 'no codificado → KAM' : v.ce > 0 ? 'en cero → pedir al CEDI' : 'en cero → ejecutivo'})`).join(' · ')}</span>` : ''; })()}</summary><div>${esc(t.canal)} · punto tipo <b>${esc(t.tip)}</b>${f ? ` · faltan: ${t.falta.map(esc).join(', ')}` : ''}<br><small>Toca la estrella (i) de cada producto para ver qué hacer · ⭐⭐ prioridad 1 · ⭐ prioridad 2 · aplica al lineal natural; los convenios van aparte.</small></div></details>`; })()}
    <div class="ipf">${VER.map(([k, tt, f]) => { const n = it.filter(f).length; return n || k === IVP.ver || k === 'din' ? `<button type="button" class="${k === IVP.ver ? 'on' : ''}" data-ipver="${k}">${tt} <small>${n}</small></button>` : ''; }).join('')}</div>
    <div class="ipo"><select data-ipord>${[['dinamica', 'Dinámica + en tienda'], ['prio', 'Prioridad'], ['marca', 'Marca'], ['mas', 'Más unidades'], ['menos', 'Menos unidades'], ['cedi', 'Más en CEDI']].map(([k, tt]) => `<option value="${k}"${k === IVP.ord ? ' selected' : ''}>${tt}</option>`).join('')}</select>
      <select data-ipmar><option value="">Todas las marcas</option>${MAR.map(m => `<option${m === IVP.mar ? ' selected' : ''}>${esc(m)}</option>`).join('')}</select></div>
    ${(() => { const G = {}; for (const v of it) if (v.din) for (const dd of v.din.split(' | ')) (G[dd] = G[dd] || []).push(v); const ks = Object.keys(G); if (!ks.length) return '';
      return `<details class="ipdn"><summary>🏷 Dinámicas del mes en este punto <small>${ks.length}</small></summary>${ks.map(k => `<div class="ipdk"><b>${esc(k)}</b><small>${G[k].map(v => esc(v.d) + (v.est !== 'ok' ? ' ⚡' : '')).join(' · ')}</small></div>`).join('')}<p class="sub" style="margin:4px 0 0">⚡ = tiene dinámica y no hay producto suficiente.</p></details>`; })()}
    <div class="ipl">${L.length ? L.map((v, k) => { const grupo=z=>IVP.ord==='dinamica'?z.orden.grupo:IVP.ord==='marca'?z.m||'Otros':IVP.ord==='prio'?z.est:'';
      const gk=grupo(v),prev=k?grupo(L[k-1]):null,n=L.filter(z=>grupo(z)===gk).length;
      const tit = gk && gk !== prev ? `<div class="ipgr">${IVP.ord==='dinamica'?GRUPOS_DIN[gk]:IVP.ord === 'marca' ? esc(gk) : INV_E[gk][0] + ' ' + INV_E[gk][1]} <small>${IVP.ord==='dinamica'?'('+n+')':n}</small></div>` : '';
      return tit + `<div class="ipr e-${v.est}" data-inv-ean="${esc(v.e)}"><div class="ipn"><b>${INV_E[v.est][0]} ${esc(v.d)}</b>${adaptador.prioridad(v)}${adaptador.cap(v.d)}${v.tags.map(t=>`<small class="ipd" data-inv-badge="${t.tipo}" style="display:inline-block;margin-right:5px">${esc(t.texto)}</small>`).join('')}<small>${esc(v.m)}${v.plu ? ' · <b class="plu">PLU ' + esc(v.plu) + '</b>' : ''} · EAN ${esc(v.e)}${v.alc != null && v.alc >= 0 ? ' · alcanza ' + nf(v.alc) + ' días' : ''}</small>${v.pvp || v.web ? `<small>${v.pvp ? '💲 PVP sugerido $' + Math.round(v.pvp).toLocaleString('es-CO') : ''}${v.pvp && v.web ? ' · ' : ''}${v.web ? '🛒 web $' + Math.round(v.web).toLocaleString('es-CO') : ''}</small>` : ''}${v.acc ? `<small class="ipa">👉 ${esc(v.acc)}</small>` : ''}</div>
      <div class="ipq"><span><small>Tienda</small><b>${v.est === 'noap' || v.est === 'sd' ? '—' : nf(v.q)}</b></span><span><small>CEDI</small><b>${nf(v.ce)}</b></span></div></div>`; }).join('') : '<p class="sub" style="padding:10px">Nada en este filtro.</p>'}</div></div>`;
  // El planeador conserva su escala de escritorio; solo la ventana se adapta al móvil.
  const escala=matchMedia('(pointer:coarse)').matches&&screen.width<600?Math.max(1,innerWidth/screen.width):1;
  box.style.zoom=String(escala);
  box.style.font='14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
  box.querySelector('.ipin').style.maxHeight=(innerHeight/escala*.88)+'px';
  box.hidden = false;
  if(IVP.ver!=='todo'){const activo=box.querySelector('[data-ipver="'+IVP.ver+'"]');if(activo)box.querySelector('.ipf').scrollLeft=activo.offsetLeft-12;}
}

document.addEventListener('click',e=>{
 const b=e.target.closest('[data-invpop]');if(b){e.preventDefault();e.stopPropagation();invPop(b.dataset.invpop);return}
 const box=$('#invPop');if(!box||box.hidden||!box.contains(e.target)&&e.target!==box)return;
 if(e.target.closest('[data-ipx]')||e.target===box){box.hidden=true;return}
 const f=e.target.closest('[data-ipver]');if(f){IVP.ver=f.dataset.ipver;invPop(IVP.p,true)}
 const t=e.target.closest('[data-inv-prioridad]');if(t&&adaptador.detalle){let v=ultimo.find(v=>v.e===t.dataset.invPrioridad),x=t.parentElement.querySelector('.tpSV');if(!x){x=document.createElement('span');x.className='tpSV';x.innerHTML=adaptador.detalle(v);t.parentElement.appendChild(x)}else x.hidden=!x.hidden}
});
document.addEventListener('change',e=>{if(e.target.matches('#invPop [data-ipord]')){IVP.ord=e.target.value;invPop(IVP.p,true)}if(e.target.matches('#invPop [data-ipmar]')){IVP.mar=e.target.value;invPop(IVP.p,true)}});
return {abrir:invPop,estado:()=>({...IVP}),filas:p=>preparar(adaptador.modelo(p))};
}
return {crear,etiquetas,preparar,compararDinamica};
})();
