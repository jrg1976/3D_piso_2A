#!/usr/bin/env python3
"""Empaqueta el visor en un único HTML autocontenido.

Antes de empaquetar pasa check.js: estanqueidad de los paramentos y
conexión de las once estancias. Si falla, no se genera el visor.
"""
import os, shutil, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))

if shutil.which('node'):
    chk = subprocess.run(['node', os.path.join(D, 'check.js')], capture_output=True, text=True)
    sys.stdout.write(chk.stdout)
    if chk.returncode:
        sys.stderr.write(chk.stderr)
        sys.exit('modelo con errores geométricos: no se empaqueta')
else:
    print('aviso: sin node, no se ha podido pasar check.js')

r = lambda f: open(os.path.join(D, f), encoding='utf-8').read()
out = [r('shell.html'), '\n<script>\n' + r('three.min.js') + '\n</script>\n']
for f in ('model.js', 'build.js', 'app.js'):
    out.append('<script>\n' + r(f) + '\n</script>\n')
out.append('<script>init();</script>\n')
dst = os.path.join(D, 'piso-b-3d.html')
open(dst, 'w', encoding='utf-8').write(''.join(out))
print(dst, round(os.path.getsize(dst) / 1e6, 3), 'MB')
