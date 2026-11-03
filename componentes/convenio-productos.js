// Fuente única: productos y montajes de convenios en coordinador, /i/ y /val/.
const ConvenioProductos=(()=>{
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nombres={'7707397792763':'Sensodyne Protección Completa Econopack 180 g','7794640170133':'Sensodyne Repara y Protege 100 g','7896009498091':'Sensodyne Protección Completa 90 g','7794640170720':'Sensodyne Repara y Protege Blanqueadora 100 g','7707397791629':'Dolex Forte x10','7707397791469':'Dolex Avanzado x24','7702132008611':'Advil Max x10 cápsulas','7451079001543':'Dolex Gripa x12','7707397792503':'Advil Gripa Max x6','7702132655495':'Advil Espalda y Cuello x5 cápsulas','7702132003814':'Today Real Sensation x3','7702132002688':'Today Lubricado x3'};
function stock(modelo,ean){const r=modelo?.it?.find(v=>String(v.e)===String(ean));return !r||modelo.sd||r.q==null||r.q===''||!Number.isFinite(Number(r.q))||['sd','noap'].includes(r.est)?'sin dato':Number(r.q)>0?'✅ tienda '+r.q:Number(r.q)===0?'❌ tienda 0 → pedir':'inventario negativo → verificar';}
function modelo(c){return typeof invPopupModelo==='function'?invPopupModelo(c):typeof D!=='undefined'?D.inv?.popupModelos?.[c]:null;}
function chip(m){const lateral=m.cenco.filter(x=>x.startsWith('Lateral')).map(x=>x.match(/\d+/)?.[0]).filter(Boolean);return [lateral.length?'🧱 Lateral '+lateral.join(' y ')+' Perfumería':'',m.cenco.some(x=>x.startsWith('Fila'))?'🧱 Fila única cajas':''].filter(Boolean).join(' · ');}
function planning(c,m){if(!m.cenco.length)return '';const a=modelo(c);return '<p><b>🧱 Espacio pagado por Haleon en este '+(/JUMBO/i.test(a?.n||'')?'Jumbo':'punto')+'</b> · 1–30 nov (planning de Valentina, KAM Cencosud)</p>'+m.cenco.map(t=>{
 const r=m.guia.planning?.[t],saved=lista(c).find(x=>x.id==='planning:'+t||x.n===t),refs=(r?.ean||[]).map(e=>({e,d:nombres[e]||a?.it?.find(v=>String(v.e)===String(e))?.d||'EAN '+e,plu:a?.it?.find(v=>String(v.e)===String(e))?.plu||''}));
 const title=t.startsWith('Fila')?'Fila única de cajas (OTC)':t.replace('Lateral ','Lateral N.º ').replace('Perfumeria','sección Perfumería');
 return '<div data-convenio-planning="'+esc(t)+'"><div>'+cabecera(saved||{n:t},title)+'</div><p>1–30 nov → '+(t.includes('38')?'solo Sensodyne':t.includes('43')?'Sensodyne + Dolex + Advil':'Sensodyne + Advil + Dolex + Today')+'</p>'+lleva({...saved,n:t,refs,modo:r?'cargue exacto del planning':'por definir con Diego'},c)+'</div>';
 }).join('')+'<p><b>Qué hacer:</b></p><p>1) Ubica el lateral por su número en Perfumería o la fila única de cajas.</p><p>2) Coloca solo estos productos, llenos y con precio.</p><p>3) Si falta alguno con stock 0, pídelo; si el espacio lo ocupa otra marca, avisa a Diego.</p><p>4) Foto del espacio completo.</p>';}
const datos=()=>typeof MEDREF==='function'?MEDREF()?.convenioProductos:null;
function catalogo(c,base){const d=datos();if(!d||!d.olimpica.includes(String(c)))return base;const seen=new Set(base.map(r=>JSON.stringify([r[0],r[1],r[3],r[4],r[5],r[6]])));return base.concat(d.dinamicas.filter(r=>{const k=JSON.stringify([r[0],r[1],r[3],r[4],r[5],r[6]]);if(seen.has(k))return false;seen.add(k);return true;}));}
function lista(c,mes='2026-11'){return (datos()?.pdv[String(c)]||[]).filter(x=>x.ini.slice(0,7)<=mes&&x.fin.slice(0,7)>=mes);}
function chipsProducto(c,v){const now=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Bogota'}).format(new Date()),ls=lista(c,now.slice(0,7));return ls.filter(x=>x.refs.some(r=>r.e&&String(r.e)===String(v.e)||r.plu&&v.plu&&String(r.plu)===String(v.plu))).map(x=>'<small class="ipd" data-convenio-chip="'+esc(x.id)+'">📌 Convenio: '+esc(x.n)+(x.ini>now?' · desde '+esc(x.ini):'')+'</small>').join('');}
function fotoOficial(k,nota){return '<button type="button" class="mes-foto" aria-label="Ampliar '+esc(nota)+'"><img alt="'+esc(nota)+'" width="120" loading="lazy" data-cp-foto="'+esc(k)+'"></button>';}
function guiaCadena(c){const g=datos()?.guiasCadena,a=g?.pdv[String(c)];if(!a)return '';if(a.cadena==='CAFAM')return '<section class="mes-seccion" data-guia-cadena="CAFAM"><strong>Cómo montar en Cafam · Ofertas destacadas del mes</strong><p>Exhibir en la zona caliente con el rótulo rosado “Ofertas destacadas del mes”. Aplica donde el producto esté vectorizado; verificar las referencias y la vigencia de la parrilla.</p>'+fotoOficial('cafam_mecanica','Mecánica oficial Cafam · Liliana Vera')+'<small>'+esc(g.fuenteCafam)+'</small></section>';
 return '<section class="mes-seccion" data-guia-cadena="COLSUBSIDIO"><strong>Cómo montar en Colsubsidio</strong>'+g.reglasColsubsidio.map(t=>'<p>'+esc(t)+'</p>').join('')+(!a.espacios.length?'<p>Este correo no asigna una exhibición adicional a este PDV.</p>':'')+'<small>'+esc(g.fuenteColsubsidio)+'</small></section>';}
function gruposReferencias(refs,nombre,fila){
 const grupos=new Map();
 for(const ref of refs){
  const text=String(nombre(ref)||'Referencia sin nombre');
  const marca=text.match(/\b(Today|Sensodyne|Advitabs|Advil|Dolex|Voltaren|Caltrate|Centrum|Corega|Parodontax|Scott|Aquafresh)\b/i);
  const key=marca?marca[0][0].toUpperCase()+marca[0].slice(1).toLowerCase():text;
  if(!grupos.has(key))grupos.set(key,[]);
  grupos.get(key).push(fila(ref));
 }
 return Array.from(grupos,([key,rows])=>'<details class="cp-grupo"><summary>'+esc(key)+' · '+rows.length+(rows.length===1?' referencia':' referencias')+'</summary>'+rows.join('')+'</details>').join('');
}
function historialReferencia(c,x){
 if(typeof D==='undefined'||!Array.isArray(D.gest)||!x.id)return '';
 const rr=D.gest.filter(g=>String(g.p)===String(c)&&String(g.ce)===String(x.id)&&g.ad==='NEGOCIADA').sort((a,b)=>b.f.localeCompare(a.f));
 if(!rr.length)return '';
 return '<details><summary>Gestiones registradas · '+rr.length+'</summary>'+rr.map(g=>'<p><b>'+esc(g.f.slice(0,10))+' · '+esc(g.un||g.u)+'</b><br>'+esc(g.mo||'Sin causal registrada')+'<br>Observación: <span style="white-space:pre-wrap">'+esc(g.ob||'Sin observación escrita.')+'</span></p>').join('')+'</details>';
}
function nombreCorto(v){
 let s=nombres[v.e]||String(v.d||'Referencia por definir');
 const marca=s.match(/\b(Today|Sensodyne|Advitabs|Advil|Dolex|Voltaren|Caltrate|Centrum|Corega|Parodontax|Scott|Aquafresh)\b/i);
 if(marca)s=s.slice(marca.index);
 // Las descripciones farmacológicas conservan la presentación de la caja, no toda la fórmula.
 const caja=s.match(/\bCAJ\s+(\d+)\s+TAB/i);
 if(caja&&s.includes(' - '))s=s.split(' - ')[0]+' x'+caja[1];
 s=s.replace(/\b(CJA|CAJ|CJAx|FCO|FRASCO|BOTELLA|BLISTER)\b/gi,'').replace(/\b(TABS?|TABLETAS?|TBS|CAPSULAS?|CASULAS|CAPS|UND\.?)\b/gi,'').replace(/\b(ALT|NF|OPTIZORB|SB|SUB)\b/gi,'').replace(/\bgr\b/gi,'g').replace(/\bSUSP\s*x?/gi,'Susp. ').replace(/\s*[xX]\s*(\d)/g,' x$1').replace(/\s+/g,' ').trim();
 s=s.replace(/\s+N$/,'').replace(/\bPed\b/gi,'Pediátrico').replace(/\bNinos\b/gi,'Niños');
 return s;
}
function stockRef(c,v){
 const a=modelo(c);if(v.e)return stock(a,v.e);
 const r=v.plu&&a?.it?.find(r=>String(r.plu)===String(v.plu));return r?stock(a,r.e):'sin dato';
}
function fotosModelo(x){
 const fm=x.fotoModelo,keys=fm?.claves||[];
 if(!keys.length)return '<p class="cp-sin-modelo">sin foto modelo oficial</p>';
 return keys.map(k=>{const r=datos()?.modelosOficiales?.[k];return r?'<figure class="cp-modelo">'+fotoOficial(k,r.titulo)+'<figcaption>'+esc(r.fuente)+' · pág. '+r.pagina+' · '+esc(r.titulo)+'</figcaption></figure>':'';}).join('')+'<small class="cp-nota">'+esc(fm.nota)+'</small>';
}
function guiaSurtido(x){
 const g=x.guiaLleva;if(!g)return '';
 return (g.modelos||[]).map(m=>'<section class="cp-guia"><b>'+esc(m.titulo)+'</b><ul>'+m.lineas.map(l=>'<li>'+esc(l)+'</li>').join('')+'</ul></section>').join('')+(g.nota?'<p class="cp-nota">'+esc(g.nota)+'</p>':'')+(g.fuente?'<small class="cp-nota">Fuente del surtido: '+esc(g.fuente)+'</small>':'');
}
function miniatura(x){
 const k=x.fotoModelo?.claves?.[0],r=datos()?.modelosOficiales?.[k],ins=x.fotoModelo?.instruccion||'Precio visible; no tapar el producto.';
 if(!r)return '<span class="cp-mini cp-mini-vacia" role="img" aria-label="sin foto oficial">▧<small>sin foto oficial</small></span>';
 return '<button type="button" class="cp-mini" data-cp-modelo="'+esc(JSON.stringify(x.fotoModelo.claves))+'" data-cp-instruccion="'+esc(ins)+'" data-cp-nota="'+esc(x.fotoModelo.nota||'')+'" aria-label="Ampliar instructivo de '+esc(x.n)+'"><img width="48" height="48" loading="lazy" data-cp-foto="'+esc(k)+'" alt="'+esc(r.titulo)+'"></button>';
}
function cabecera(x,label){return '<span class="cp-cabecera"><span>'+esc(label||x.n)+'</span>'+miniatura(x)+'</span>';}
function lleva(x,c){
 const refs=x.refs||[],grupos=new Map(),g=x.guiaLleva;
 for(const v of refs){const n=nombreCorto(v),m=n.match(/\b(Today|Sensodyne|Advitabs|Advil|Dolex|Voltaren|Caltrate|Centrum|Corega|Parodontax|Scott|Aquafresh)\b/i),brand=m?m[1][0].toUpperCase()+m[1].slice(1).toLowerCase():'Otras referencias';if(!grupos.has(brand))grupos.set(brand,[]);grupos.get(brand).push(v);}
 const orden=['Dolex','Advil','Advitabs','Voltaren'];
 const lista=[...grupos].sort(([a],[b])=>{const ia=orden.indexOf(a),ib=orden.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib)||a.localeCompare(b);}).map(([brand,rs])=>'<section class="cp-marca"><b>'+esc(brand)+'</b><ul>'+rs.map(v=>'<li data-cp-ean="'+esc(v.e||'')+'"><span title="'+esc(v.d)+'">'+esc(nombreCorto(v))+'</span> <b class="cp-stock">'+esc(stockRef(c,v))+'</b><details class="cp-codigos"><summary>códigos</summary><small>'+esc(v.d)+(v.e?' · EAN '+esc(v.e):'')+(v.plu?' · PLU '+esc(v.plu):'')+(v.cantidad?' · '+esc(v.cantidad)+' und.':'')+'</small></details></li>').join('')+'</ul></section>').join('');
 const definido=refs.length||g?.estado==='definido';
 const titulo=refs.length?refs.length+' productos':g?.sinCargue?'material sin cargue':definido?'surtido de la guía':'surtido pendiente';
 return '<details class="cp-lleva"><summary>▶ Lleva ('+titulo+') · 📷 Así debe quedar</summary><div class="cp-contenido">'+guiaSurtido(x)+(x.modo==='según portafolio codificado'?'<small class="cp-nota">según portafolio codificado</small>':'')+(refs.length?lista:!definido?'<p>Surtido por definir con Diego.</p><small>'+esc(g?.motivo||'Sin definición documentada para este convenio.')+'</small>':'')+(x.modo&&!/por definir|según portafolio codificado|según guía oficial/.test(x.modo)?'<p>'+esc(x.modo)+'</p>':'')+'<b>📷 Así debe quedar</b>'+fotosModelo(x)+'</div></details>';
}
function detalle(x,c){return '<div class="cp-detalle">'+lleva(x,c)+historialReferencia(c,x)+'</div>';}
function convenio(c,id,n){const x=lista(c).find(x=>String(x.id)===String(id))||lista(c).find(x=>x.n===n)||{id,n,refs:[],modo:'por definir con Diego'};return cabecera(x)+detalle(x,c);}
function fichas(c,convs){
 const seen=new Set();return '<div class="cp-fichas">'+convs.filter(x=>x&&!seen.has(String(x.ce))&&seen.add(String(x.ce))).map(x=>{const saved=lista(c).find(r=>String(r.id)===String(x.ce))||{id:x.ce,n:x.e,refs:[]};return '<section class="cp-ficha">'+cabecera(saved,x.e+' · cód. '+x.ce)+detalle(saved,c)+'</section>';}).join('')+'</div>';
}

const estadoTP=s=>({cumple:'✅ cumple',parcial:'⚠️ parcial',no_cumple:'❌ no cumple',sin_dictamen:'Sin dictamen'})[s]||'Sin dictamen';
function versus(c){const r=datos()?.versus?.pdv[String(c)];if(!r)return '';return '<section class="mes-seccion" data-tp-pdv="'+esc(c)+'"><strong>🆚 Tienda Perfecta vs foto real</strong><p><b>'+estadoTP(r.estado)+'</b> · alcance revisado</p><small>'+esc(r.alcance)+'</small>'+(r.motivo?'<p>'+esc(r.motivo)+'</p>':'')+(r.ultimaFotoRegistrada?'<p>Última foto registrada en fuentes VUM consultadas: '+esc(r.ultimaFotoRegistrada)+'</p>':'')+r.acciones.map((a,i)=>'<p>'+(i+1)+'. '+esc(a)+'</p>').join('')+r.revisiones.map(x=>'<details data-tp-mueble="'+esc(x.mueble)+'"><summary>'+estadoTP(x.dictamen)+' · '+esc(x.mueble)+' · '+esc(x.fecha)+'</summary><p>'+esc(x.observado)+'</p><p>Entrepaños visibles: '+(x.entrepanos??'no determinable')+'. '+esc(x.caras)+'</p><p><b>Foto real:</b> '+esc(x.sello)+'</p>'+x.fotos.map(id=>fotoOficial('tp_real_'+id,'Foto real '+r.nombre+' · '+x.fecha)).join('')+'<p><b>Modelo oficial:</b></p>'+(x.modelo?fotoOficial(x.modelo,x.notaModelo):'<p>Sin guía oficial gráfica verificada para esta cadena y tipo de mueble.</p>')+'<small>'+esc(x.notaModelo)+'</small><p><b>Marcas y ubicación:</b> '+esc(x.marcas)+'</p><p><b>Competencia:</b> '+esc(x.competencia)+'</p><p><b>Precio:</b> '+esc(x.precio)+' · <b>POP:</b> '+esc(x.pop)+'</p><p><b>Criterio:</b> '+esc(x.regla)+'</p>'+x.acciones.map((a,i)=>'<p>'+(i+1)+'. '+esc(a)+'</p>').join('')+'</details>').join('')+(r.pendientesCandidatos?'<small>Quedan '+r.pendientesCandidatos+' registros de convenio con fotos pendientes de revisar; pueden corresponder a un mismo mueble.</small>':'')+'</section>';}
function resumen(u=''){const v=datos()?.versus;if(!v)return '';const rs=Object.entries(v.personas).filter(([k])=>!u||k===u);return '<details class="mes-pdv" data-tp-resumen><summary><b>🆚 Tienda Perfecta · resumen por persona</b></summary><p>Revisión parcial. Los contadores reflejan los hallazgos de las fotos revisadas; Sin dictamen incluye fotos pendientes y encuadres insuficientes.</p>'+rs.map(([k,r])=>'<p data-tp-persona="'+esc(k)+'"><b>'+esc(r.nombre)+'</b> · '+r.codigos.length+' PDV<br>✅ '+r.cumple+' · ⚠️ '+r.parcial+' · ❌ '+r.no_cumple+' · Sin dictamen '+r.sin_dictamen+'</p>').join('')+'</details>';}
// Ranking por PDV y campañas de tienda: nunca alimentan badges de producto.
const rankingDatos=()=>datos()?.rankingSoS;
function rankingLineas(c,mes){
 if(mes!=='2026-11')return [];
 const d=rankingDatos(),r=d?.ranking[String(c)];
 if(!r)return ['👉 Ranking en la cadena: <b>sin dato</b>','👉 Ventas promedio mes: <b>sin dato</b>','👉 Decil y tipo: sin dato · sin cruce verificado en David Bernal · SoS nov · 3-nov.'];
 return ['👉 Ranking en la cadena: <b>puesto '+r.puesto+' de '+r.total+'</b> · '+esc(r.cliente),
 '👉 Ventas promedio mes: <b>$'+Number(r.ventas).toLocaleString('es-CO',{maximumFractionDigits:0})+'</b>',
 '👉 Decil '+esc(r.decil)+' · Tipo '+esc(r.tipo),
 '👉 <small>'+esc(d.fuente)+' · comparación entre los PDV del mismo CLIENTE en Sheet3; período de ventas no especificado.</small>'];
}
function rankingPresentacion(lineas,c,mes){return mes==='2026-11'?lineas.filter(x=>!/^👉 Ranking en la cadena:/.test(x)).concat(rankingLineas(c,mes)):lineas;}
function campanasChips(c,mes){
 if(mes!=='2026-11')return [];
 const d=rankingDatos();if(!d)return [];
 return [d.sos[String(c)]?'📏 Medición SoS':'',d.olimpica[String(c)]?'💳 Descuento de tienda con tarjeta':''].filter(Boolean);
}
function sosBloque(c,mes){
 const d=rankingDatos(),r=d?.sos[String(c)];if(mes!=='2026-11'||!r)return '';
 return '<section class="mes-seccion" data-sos-pdv="'+esc(c)+'"><strong>📏 Medición SoS · noviembre</strong><p>Ruta/usuario en la fuente: '+esc(r.usuario)+' · Aplica Today: <b>'+(r.today?'Sí (X)':'No marcado')+'</b>.</p>'+d.criterios.pasos.map((x,i)=>'<p>'+(i+1)+') '+esc(x)+'</p>').join('')+'<p><b>En este punto:</b> '+esc(d.criterios.categorias.join(' · '))+(r.today?' · Condones/Today.':'. Condones/Today no está marcado para este punto.')+'</p><p>Visitas programadas en noviembre: '+(r.visitas.length?r.visitas.join(', '):'ALERTA · sin visita programada')+'.</p><small>'+esc(d.fuente)+' · PDVs, Criterios, Seleccion muestra, Today y Resumen. '+esc(d.criterios.nota)+' '+esc(d.criterios.resumen)+'</small></section>';
}
function masivosBloque(c,mes){
 const d=rankingDatos(),r=d?.olimpica[String(c)];if(mes!=='2026-11'||!r)return '';
 const fila=x=>'<p data-tarjeta-fecha="'+x.fecha+'"><b>'+Number(x.fecha.slice(8))+'-nov-2026 · '+esc(x.descuento)+'</b> · '+esc(x.cobertura)+'</p>';
 const aplica=d.masivos.filter(x=>r.bogota||x.cobertura==='Nacional'),otros=d.masivos.filter(x=>!r.bogota&&x.cobertura!=='Nacional');
 return '<section class="mes-seccion" data-masivos-pdv="'+esc(c)+'"><strong>💳 Descuento de tienda con tarjeta</strong>'+aplica.map(fila).join('')+(otros.length?'<details><summary>Solo Distrito Bogotá · no aplican en '+esc(r.ciudad)+'</summary>'+otros.map(fila).join('')+'</details>':'')+'<small>Susana Robledo · Olímpica · 3-nov. Descuentos de tienda, no por EAN. TCO: tarjeta Olímpica de crédito; TP: tarjeta de puntos. Confirma las condiciones de la tarjeta en tienda.</small></section>';
}

function bloque(c,mes){const ls=lista(c,mes).filter(x=>!x.id.startsWith('planning:'));return sosBloque(c,mes)+masivosBloque(c,mes)+(mes==='2026-11'?guiaCadena(c)+versus(c):'')+(ls.length?'<section class="mes-seccion"><strong>📌 Productos por convenio y exhibición</strong>'+ls.map(x=>'<details data-cp-id="'+esc(x.id)+'"><summary>'+cabecera(x)+'</summary>'+detalle(x,c)+'<small>Fuente: '+esc(x.fuente)+'</small></details>').join('')+'</section>':'');}
async function cargar(){if(datos())return;const m=MEDREF(),r=await fetch('../m/convenios-productos-03nov.bin',{cache:'no-store'});if(!r.ok)throw new Error('No se pudo cargar el surtido de convenios');const b=new Uint8Array(await r.arrayBuffer()),key=await crypto.subtle.importKey('raw',Uint8Array.from(atob(m.k),c=>c.charCodeAt(0)),'AES-GCM',false,['decrypt']),raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12)},key,b.slice(12));const obj=JSON.parse(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text());m.convenioProductos=obj;m.convenioFotos=obj.fotos;}
if(typeof document!=='undefined'){
 if(!document.getElementById('cp-estilo')){const st=document.createElement('style');st.id='cp-estilo';st.textContent=".cp-detalle,.cp-fichas,.cp-ficha{min-width:0;max-width:100%;box-sizing:border-box}.cp-fichas{clear:both;margin-top:6px}.cp-ficha{padding:5px 0;border-top:1px solid #e2e8f0}.cp-ficha>small{display:block;color:#5a6474;font-size:11px}.cp-lleva{width:100%;margin:3px 0;box-sizing:border-box}.cp-lleva>summary{display:block!important;list-style:none!important;white-space:normal;cursor:pointer;font-size:clamp(10px,3.2vw,12px);padding:5px 0!important;line-height:1.4}.cp-lleva>summary::after{content:none!important}.cp-lleva>summary::-webkit-details-marker{display:none}.cp-contenido{padding:5px 0;white-space:normal;overflow-wrap:break-word}.cp-nota,.cp-codigos{color:#667085;font-size:11px}.cp-nota{display:block;margin:3px 0 6px}.cp-marca{margin:6px 0}.cp-marca ul{list-style:none;margin:3px 0;padding:0}.cp-marca li{margin:0;padding:5px 0;border-bottom:1px solid #eee;font-size:12px;line-height:1.4}.cp-stock{font-size:11px;font-weight:500;white-space:normal}.cp-codigos{display:inline-block;vertical-align:top;margin-left:4px;max-width:100%}.cp-codigos>summary{display:inline!important;cursor:pointer;padding:0!important;font-size:10px;list-style:none}.cp-codigos>summary::after{content:none!important}.cp-codigos[open]{display:block;margin:3px 0;overflow-wrap:anywhere}.cp-modelo{display:inline-block;vertical-align:top;margin:4px;max-width:140px}.cp-modelo figcaption{font-size:10px;color:#667085}.cp-modelo .mes-foto img{width:120px;height:86px;object-fit:contain}.cp-sin-modelo{font-size:12px;color:#667085}.rcp>.cp-detalle{grid-column:1/-1;width:100%}.cp-cabecera{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-width:0}.cp-cabecera>span:first-child{min-width:0;overflow-wrap:anywhere}.cp-mini{flex:0 0 48px;width:48px;height:48px;border:1px solid #d5dbe3;border-radius:5px;padding:0;background:#fff;cursor:zoom-in;overflow:hidden;box-sizing:border-box}.cp-mini img{display:block;width:48px;height:48px;object-fit:contain}.cp-mini-vacia{display:flex;flex-direction:column;align-items:center;justify-content:center;background:#eee;color:#667085;cursor:default;font-size:16px}.cp-mini-vacia small{font-size:8px;line-height:1.1;text-align:center}.cp-guia{font-size:12px;line-height:1.4}.cp-guia ul{padding-left:18px}.cp-guia li{margin:3px 0}.cp-modelo-dialog{box-sizing:border-box;width:min(94vw,900px);max-height:90vh;overflow:auto;border:0;border-radius:8px;padding:12px;color:#243040}.cp-modelo-dialog::backdrop{background:#0009}.cp-modelo-dialog figure{margin:8px 0}.cp-modelo-dialog img{display:block;width:100%;height:auto;max-height:70vh;object-fit:contain}.cp-modelo-dialog figcaption{font-size:11px}.cp-cerrar{display:block;margin-left:auto;padding:8px}.cp-instruccion{font-weight:600;font-size:13px}.cp-modelo-dialog small{font-size:11px}";document.head.append(st);}
 const fotosCache=new Map();
 const fotoURL=k=>{if(!fotosCache.has(k))fotosCache.set(k,Promise.resolve().then(()=>medImg('convenioFotos',k)).catch(()=>{fotosCache.delete(k);return '';}));return fotosCache.get(k);};
 const visible=im=>{for(let d=im.parentElement;d;d=d.parentElement){if(d.tagName==='DETAILS'&&!d.open){const s=Array.from(d.children||[]).find(c=>c.tagName==='SUMMARY');if(!s?.contains(im))return false;}}return true;};
 const cargarFotos=root=>root.querySelectorAll?.('[data-cp-foto]:not([src])').forEach(im=>{if(!visible(im))return;fotoURL(im.dataset.cpFoto).then(u=>{if(u&&im.isConnected!==false)im.src=u;});});
 document.addEventListener('toggle',e=>{if(e.target.open)cargarFotos(e.target);},true);
 document.addEventListener('click',async e=>{
  const btn=e.target?.closest?.('[data-cp-modelo]');
  if(btn){
   e.preventDefault();e.stopPropagation();
   let dlg=document.getElementById('cp-modelo-dialog');
   if(!dlg){dlg=document.createElement('dialog');dlg.id='cp-modelo-dialog';dlg.className='cp-modelo-dialog';document.body.append(dlg);dlg.addEventListener('click',ev=>{if(ev.target===dlg)dlg.close();});}
   const keys=JSON.parse(btn.dataset.cpModelo),ins=btn.dataset.cpInstruccion,nota=btn.dataset.cpNota;
   dlg.innerHTML='<button type="button" class="cp-cerrar" aria-label="Cerrar instructivo">Cerrar ×</button><div class="cp-ampliadas">'+keys.map(k=>{const r=datos()?.modelosOficiales?.[k];return r?'<figure><img data-cp-foto="'+esc(k)+'" alt="'+esc(r.titulo)+'"><figcaption>'+esc(r.titulo)+' · '+esc(r.fuente)+' · pág. '+r.pagina+'</figcaption></figure>':'';}).join('')+'</div><p class="cp-instruccion">'+esc(ins)+'</p><small>'+esc(nota)+'</small>';
   dlg.querySelector('.cp-cerrar').onclick=()=>dlg.close();
   if(!dlg.open)dlg.showModal();cargarFotos(dlg);return;
  }
  setTimeout(()=>cargarFotos(document),0);
 },true);
 if(typeof MutationObserver!=='undefined')new MutationObserver(()=>cargarFotos(document)).observe(document.body||document.documentElement,{childList:true,subtree:true});
 setTimeout(()=>cargarFotos(document),0);

}
return {miniatura,cabecera,guiaSurtido,lleva,nombreCorto,stockRef,fichas,rankingLineas,rankingPresentacion,campanasChips,sosBloque,masivosBloque,stock,chip,planning,modelo,catalogo,lista,detalle,convenio,bloque,chipsProducto,cargar,guiaCadena,versus,resumen};
})();
