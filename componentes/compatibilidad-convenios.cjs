// Reglas genéricas. La evidencia por punto permanece en el suplemento cifrado.
const assert = require('assert/strict');
const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const cadena = s => /OLIMPICA|SAO/.test(norm(s)) ? 'OLIMPICA' : norm(s);
function categorias(text) {
  const s = norm(text), out = [];
  if (/GARGANTA|ADVITABS/.test(s)) out.push('GARGANTA');
  if (/GRIPA|ANTIGRIPAL|GRIPAMAX/.test(s)) out.push('GRIPA');
  if (/SENSODYNE|\bSDY\b|SALUD ORAL|CUIDADO ORAL|PLANOMETRIA OC|ENTREPANO OC/.test(s)) out.push('SENSODYNE');
  if (/COREGA/.test(s)) out.push('COREGA');
  if (/CENTRUM|MULTIVITAMIN|\bVITAMINAS?\b/.test(s)) out.push('CENTRUM');
  if (/SCOTT/.test(s)) out.push('SCOTT');
  if (/TODAY|PRESERVATIV|CONDONES|SEXUAL|TRIPLEPLEASURE|REALSENSATION/.test(s)) out.push('TODAY');
  if (/VOLTAREN|DOLOR MUSCULAR/.test(s)) out.push('VOLTAREN');
  const analgesicos = s.replace(/(?:DOLEX|ADVIL)\s*(?:\|\s*)?GRIPA(?:\s*MAX)?/g, '').replace(/DOLOR\s*(?:DE\s*)?GARGANTA|DOLOR MUSCULAR/g, '');
  if (/DOLEX|ADVIL(?!TABS)|ANALGESIC|\bDOLOR\b|\bFORTE\b|\bACTIVGEL\b|\bRA24\b/.test(analgesicos)) out.push('DOLOR');
  return [...new Set(out)].sort();
}
function mueble(text) {
  const s = norm(text);
  if (!s || /NO DETERMINABLE|SIN FOTO|SIN EVIDENCIA|NO IDENTIFICABLE/.test(s)) return 'NO CONFIRMADO';
  if (/BANDEJA.*TODAY|TODAY.*BANDEJA/.test(s)) return 'BANDEJA TODAY';
  if (/COUNTER|HABLADOR|GLORIFICADOR/.test(s) && !/RACK|BANDEJA|CARGUE/.test(s)) return 'COUNTER';
  if (/PUESTO.*PAGO|CHECKOUT|RACK.*CAJA|CAJA.*RACK|BANDEJA.*CAJA/.test(s)) return 'PUESTO DE PAGO';
  if (/MINIGONDOLA|MINI GONDOLA|INCLINAD/.test(s)) return 'MINIGONDOLA';
  if (/VITRINA/.test(s)) return 'VITRINA';
  if (/DETRAS.*MOSTRADOR|TRAS.*DEPENDIENTE|ESTANTERIA.*MOSTRADOR/.test(s)) return 'DETRAS DEL MOSTRADOR';
  if (/PUNTA|CABECERA/.test(s)) return 'PUNTA DE GONDOLA';
  if (/REJILLA|LATERAL|PARRILLERA/.test(s)) return 'REJILLA / LATERAL';
  if (/ROMPETRAFICO/.test(s)) return 'ROMPETRAFICO';
  if (/RISTRA/.test(s)) return 'RISTRA';
  if (/FILA UNICA|UNIFILA/.test(s)) return 'FILA UNICA';
  if (/LINEAL|AUTOSERVICIO|GONDOLA ABIERTA|ESTANTERIA|ESTANTE/.test(s)) return 'LINEAL';
  if (/ENTREPANO/.test(s)) return 'ENTREPANO';
  if (/POP|GAVETERO|ANTENA|CENEFA/.test(s)) return 'POP';
  if (/MODULO/.test(s)) return 'MODULO';
  return 'NO CONFIRMADO';
}
function aplicar(cp) {
  const audit = cp.compatibilidadConvenios;
  assert.ok(audit?.version === '2026-11-04', 'Falta auditoría de categoría y mueble por convenio');
  for (const [key, a] of Object.entries(audit.ventanas)) {
    const m = cp.mediaConvenios[key]; assert.ok(m, 'Ventana ausente: ' + key);
    m.modelos = a.modelos.map(key => ({key, grupo:'Tienda Perfecta', verificado:true,
      nota:'Categoría, mueble y cadena contrastados. '+a.notaModelo}));
    m.ejemplos = a.referencias;
    // Una foto del equipo siempre es referencia, nunca un modelo oficial.
    m.modeloEquipo = null;
    m.compatibilidad = {version:audit.version, categoria:a.categorias.join(' + ') || 'NO CONFIRMADA',
      mueble:a.mueble, motivo:a.motivo, sinModelo:'Sin modelo TP para este mueble'};
    const [pdv, codigo] = key.split('|');
    for (const x of cp.pdv[pdv] || []) if (String(x.id) === codigo)
      x.fotoModelo = {...x.fotoModelo, claves:a.modelos, verificado:a.modelos.length > 0, nota:a.notaModelo};
  }
  return cp;
}
module.exports = {norm, cadena, categorias, mueble, aplicar};
