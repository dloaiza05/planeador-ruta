const serial=v=>JSON.stringify(v,(_,x)=>Object.is(x,-0)?'__NEGZERO_INTERNAL__':x).replaceAll('"__NEGZERO_INTERNAL__"','-0');
// Paso final de los generadores locales. Este archivo contiene solo código.
const fs=require('fs'),p=require('path'),cr=require('crypto'),z=require('zlib'),A=require('assert/strict');
const hash=x=>cr.createHash('sha256').update(x).digest('hex');
const json=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));
function dec(o,k){const d=cr.createDecipheriv('aes-'+k.length*8+'-gcm',k,Buffer.from(o.i,'base64')),c=Buffer.from(o.c,'base64');d.setAuthTag(c.subarray(-16));return z.inflateRawSync(Buffer.concat([d.update(c.subarray(0,-16)),d.final()])).toString();}
function enc(o,k,s){const iv=cr.randomBytes(12),e=cr.createCipheriv('aes-'+k.length*8+'-gcm',k,iv);return {...o,i:iv.toString('base64'),c:Buffer.concat([e.update(z.deflateRawSync(s)),e.final(),e.getAuthTag()]).toString('base64')};}
function run(root,dest=p.join(root,'planeador-web')){
 const source=p.join(root,'planeador-web/componentes'),cp=json(p.join(root,'datos/convenios_productos_03nov2026.json'));
 for(const f of ['ultimasCapturas','versusPorFoto','mediaConvenios','fotos'])A.ok(Object.keys(cp[f]||{}).length,'Fuente incompleta: '+f);
 const fix=json(p.join(root,'analizador/vista_fija.json')),aliases=[fix,...fix.alias];A.equal(new Set(aliases.map(a=>a.id)).size,9);
 const report={aliases:[],campos:Object.fromEntries(['ultimasCapturas','versusPorFoto','mediaConvenios'].map(k=>[k,Object.keys(cp[k]).length])),cpHash:hash(JSON.stringify(cp)),archivos:[]};
 function enrich(d){const m=d.med||d.inv?.med;A.ok(m?.k,'Falta clave local de medios');m.convenioProductos=cp;m.convenioFotos=cp.fotos;return d;}
 function patch(s){for(const [mark,file]of [['COMPONENTE_INV_COMPARTIDO','inv-popup.js'],['CONVENIO_PRODUCTOS','convenio-productos.js']]){const re=new RegExp('// INICIO_'+mark+'\\r?\\n[\\s\\S]*?// FIN_'+mark,'g');A.equal([...s.matchAll(re)].length,1,'Componente ausente/duplicado: '+mark);s=s.replace(re,()=>'// INICIO_'+mark+'\n'+fs.readFileSync(p.join(source,file),'utf8').replace(/\r/g,'')+'\n// FIN_'+mark);}
 if(s.includes('const COORD =')){const file=p.join(root,'datos/analisis_tp_anaqueles.json');A.ok(fs.existsSync(file),'Falta análisis privado TP');const block='// INICIO_ANALISIS_TP_DIEGO\nconst TP_ANALISIS_DIEGO = '+JSON.stringify(json(file))+';\n// FIN_ANALISIS_TP_DIEGO\n';s=s.replace(/\/\/ INICIO_ANALISIS_TP_DIEGO\n[\s\S]*?\/\/ FIN_ANALISIS_TP_DIEGO\n/g,'').replace('// INICIO_CONVENIO_PRODUCTOS',()=>block+'// INICIO_CONVENIO_PRODUCTOS');if(!s.includes('ConvenioProductos.montarAnalisisTP();'))s=s.replace('async function pintarConv(recargar) {','async function pintarConv(recargar) {\nConvenioProductos.montarAnalisisTP();');}
 return s.replace(/^const (D|EMB) = (\{.*?\});\r?$/m,(_,n,raw)=>'const '+n+' = '+serial(enrich(JSON.parse(raw)))+';');}
 const pending=[];
 function queue(f,raw){pending.push([p.join(dest,f),raw]);report.archivos.push(f);}
 const password=json(p.join(root,'analizador/clave_web.json')).clave.toUpperCase().replace(/[^A-Z0-9]/g,''),re=/<script id="x" type="application\/json">([^<]+)/;
 const raw=fs.readFileSync(p.join(dest,'index.html'),'utf8'),match=raw.match(re);A.ok(match,'Coordinador sin cifrar');
 const o=JSON.parse(match[1]),k=cr.pbkdf2Sync(password,Buffer.from(o.s,'base64'),o.n,32,'sha256'),before=dec(o,k),after=patch(before);
 const data=s=>JSON.parse(s.match(/^const (?:D|EMB) = (\{.*?\});\r?$/m)[1]);
 const strip=d=>{const v=structuredClone(d),m=v.med||v.inv.med;delete m.convenioProductos;delete m.convenioFotos;return v;};
 A.deepEqual(strip(data(before)),strip(data(after)),'Inventario o rutas alterados');
 // El código ajeno a los dos componentes y al suplemento se conserva literalmente.
 const sealed=enc(o,k,after);A.equal(dec(sealed,k),after);
 queue('index.html',raw.replace(match[1],()=>JSON.stringify(sealed)));
 const viewer=fs.readFileSync(p.join(dest,'i/index.html'),'utf8');queue('i/index.html',patch(viewer));
 for(const a of aliases){const f='i/'+a.id+'.json',o=json(p.join(dest,f)),key=cr.createHash('sha256').update(a.k).digest().subarray(0,16),v=JSON.parse(dec(o,key)),old=structuredClone(v);enrich(v.D);const check=structuredClone(v);check.D=strip(check.D);old.D=strip(old.D);A.deepEqual(check,old,'Cambio ajeno a convenios: '+f);
  A.deepEqual([Object.keys({...v.D.users,...v.D.periferiaInventario.users}).length,Object.keys({...v.D.pdv,...v.D.periferiaInventario.pdv}).length,Object.keys(v.D.users).length,Object.keys(v.D.pdv).length,Object.values(v.vis).flat().length],[21,450,17,325,1156]);
  const out=enc(o,key,serial(v));A.deepEqual(JSON.parse(dec(out,key)),v);queue(f,JSON.stringify(out));report.aliases.push({id:a.id,conservado:true});
 }
 // Validar todo antes de escribir: nunca publicar datos descifrados ni borrar archivos.
 for(const [file,content]of pending)fs.writeFileSync(file,content);
 report.cifradoVerificado=true;report.borrados=0;return report;
}
module.exports={run,dec,enc};
if(require.main===module){try{const root=p.resolve(process.argv[2]||p.join(__dirname,'../..'));console.log(JSON.stringify(run(root,process.argv[3]?p.resolve(process.argv[3]):undefined)));}catch(e){console.error('Integración detenida: '+e.message);process.exitCode=1;}}
