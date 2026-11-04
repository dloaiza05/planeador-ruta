"""Contrato del paso final; la implementación operativa está en analizador."""
import os
import subprocess


def integrar_convenios(raiz, destino):
    script = os.path.join(raiz, 'planeador-web', 'componentes',
                          'integracion-convenios.cjs')
    return subprocess.run(['node', script, raiz, destino], cwd=raiz,
                          check=True, capture_output=True, text=True,
                          encoding='utf-8')
