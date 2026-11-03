// Fuente única: productos y montajes de convenios en coordinador, /i/ y /val/.
const ConvenioProductos=(()=>{
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nombres={'7707397792763':'Sensodyne Protección Completa Econopack 180 g','7794640170133':'Sensodyne Repara y Protege 100 g','7896009498091':'Sensodyne Protección Completa 90 g','7794640170720':'Sensodyne Repara y Protege Blanqueadora 100 g','7707397791629':'Dolex Forte x10','7707397791469':'Dolex Avanzado x24','7702132008611':'Advil Max x10 cápsulas','7451079001543':'Dolex Gripa x12','7707397792503':'Advil Gripa Max x6','7702132655495':'Advil Espalda y Cuello x5 cápsulas','7702132003814':'Today Real Sensation x3','7702132002688':'Today Lubricado x3'};
function stock(modelo,ean){const r=modelo?.it?.find(v=>String(v.e)===String(ean));return !r||modelo.sd||r.q==null||['sd','noap'].includes(r.est)?'sin dato':r.q>0?'✅ tienda '+r.q:r.q===0?'❌ tienda 0 → pedir':'inventario negativo → verificar';}
function modelo(c){return typeof invPopupModelo==='function'?invPopupModelo(c):typeof D!=='undefined'?D.inv?.popupModelos?.[c]:null;}
function chip(m){const lateral=m.cenco.filter(x=>x.startsWith('Lateral')).map(x=>x.match(/\d+/)?.[0]).filter(Boolean);return [lateral.length?'🧱 Lateral '+lateral.join(' y ')+' Perfumería':'',m.cenco.some(x=>x.startsWith('Fila'))?'🧱 Fila única cajas':''].filter(Boolean).join(' · ');}
function planning(c,m){if(!m.cenco.length)return '';const a=modelo(c);return '<p><b>Espacio pagado por Haleon en este '+(/JUMBO/i.test(a?.n||'')?'Jumbo':'punto')+'</b> · 1–30 nov (planning de Valentina, KAM Cencosud)</p>'+m.cenco.map(t=>{
 const r=m.guia.planning?.[t];if(!r)return '<p>'+esc(t)+' · Lleva: por definir con Diego</p>';
 const title=t.startsWith('Fila')?'Fila única de cajas (OTC)':t.replace('Lateral ','Lateral N.º ').replace('Perfumeria','sección Perfumería');
 return '<div data-convenio-planning="'+esc(t)+'"><p><b>'+esc(title)+'</b> → '+(t.includes('38')?'solo Sensodyne':t.includes('43')?'Sensodyne + Dolex + Advil':'Sensodyne + Advil + Dolex + Today')+'</p><p><b>Lleva:</b></p>'+r.ean.map(e=>'<p>'+esc(nombres[e]||a?.it?.find(v=>v.e===e)?.d||'EAN '+e)+' · EAN '+esc(e)+' · '+esc(stock(a,e))+'</p>').join('')+'</div>';
 }).join('')+'<p><b>Qué hacer:</b> 1) Ubica el lateral por su número en Perfumería o la fila única de cajas. 2) Coloca solo estos productos, llenos y con precio. 3) Si falta alguno con stock 0, pídelo; si el espacio lo ocupa otra marca, avisa a Diego. 4) Foto del espacio completo.</p>';}
const datos=()=>typeof MEDREF==='function'?MEDREF()?.convenioProductos:null;
function catalogo(c,base){const d=datos();if(!d||!d.olimpica.includes(String(c)))return base;const seen=new Set(base.map(r=>JSON.stringify([r[0],r[1],r[3],r[4],r[5],r[6]])));return base.concat(d.dinamicas.filter(r=>{const k=JSON.stringify([r[0],r[1],r[3],r[4],r[5],r[6]]);if(seen.has(k))return false;seen.add(k);return true;}));}
function lista(c,mes='2026-11'){return (datos()?.pdv[String(c)]||[]).filter(x=>x.ini.slice(0,7)<=mes&&x.fin.slice(0,7)>=mes);}
function chipsProducto(c,v){const now=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Bogota'}).format(new Date()),ls=lista(c,now.slice(0,7));return ls.filter(x=>x.refs.some(r=>r.e&&String(r.e)===String(v.e)||r.plu&&v.plu&&String(r.plu)===String(v.plu))).map(x=>'<small class="ipd" data-convenio-chip="'+esc(x.id)+'">📌 Convenio: '+esc(x.n)+(x.ini>now?' · desde '+esc(x.ini):'')+'</small>').join('');}
function detalle(x){const r=x.refs.map(v=>esc(v.d)+(v.e?' · EAN '+esc(v.e):'')+(v.plu?' · PLU '+esc(v.plu):'')+(v.cantidad?' · '+esc(v.cantidad)+' und.':''));
 const foto=x.foto?'<button type="button" class="mes-foto" aria-label="Ampliar Así debe quedar"><img alt="Así debe quedar · planograma de marca" width="120" loading="lazy" data-cp-foto="'+esc(x.foto)+'"></button><small>📷 Así debe quedar · referencia de marca, adaptar al espacio asignado.</small>':'';
 return '<div class="cp-detalle"><p><b>Lleva:</b> '+(r.length?r.join(' · '):esc(x.modo))+'</p>'+(r.length?'<small>'+esc(x.modo)+'</small>':'')+foto+'</div>';}
function convenio(c,id,n){const x=lista(c).find(x=>String(x.id)===String(id))||lista(c).find(x=>x.n===n);return x?detalle(x):'<div class="cp-detalle"><b>Lleva:</b> por definir con Diego</div>';}
function bloque(c,mes){const ls=lista(c,mes).filter(x=>!x.id.startsWith('planning:'));return ls.length?'<section class="mes-seccion"><strong>📌 Productos por convenio y exhibición</strong>'+ls.map(x=>'<details data-cp-id="'+esc(x.id)+'"><summary>'+esc(x.n)+'</summary>'+detalle(x)+'<small>Fuente: '+esc(x.fuente)+'</small></details>').join('')+'</section>':'';}
async function cargar(){if(datos())return;const m=MEDREF(),r=await fetch('../m/convenios-productos-03nov.bin',{cache:'no-store'});if(!r.ok)throw new Error('No se pudo cargar el surtido de convenios');const b=new Uint8Array(await r.arrayBuffer()),key=await crypto.subtle.importKey('raw',Uint8Array.from(atob(m.k),c=>c.charCodeAt(0)),'AES-GCM',false,['decrypt']),raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12)},key,b.slice(12));const obj=JSON.parse(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text());m.convenioProductos=obj;m.convenioFotos=obj.fotos;}
if(typeof document!=='undefined'){
 const cargarFotos=root=>root.querySelectorAll?.('[data-cp-foto]:not([src])').forEach(im=>{if(im.closest('details:not([open])'))return;medImg('convenioFotos',im.dataset.cpFoto).then(u=>{if(u)im.src=u;});});
 document.addEventListener('toggle',e=>{if(e.target.open)cargarFotos(e.target);},true);
 document.addEventListener('click',()=>setTimeout(()=>cargarFotos(document),0));
 setTimeout(()=>{const m=typeof MEDREF==='function'&&MEDREF();if(m?.convenioFotos)for(const key of Object.keys(m.convenioFotos))medImg('convenioFotos',key);},3000);
}
return {stock,chip,planning,modelo,catalogo,lista,detalle,convenio,bloque,chipsProducto,cargar};
})();
