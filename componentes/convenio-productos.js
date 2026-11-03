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
return {stock,chip,planning,modelo};
})();
