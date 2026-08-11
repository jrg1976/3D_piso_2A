#!/usr/bin/env python3
"""Empaqueta el visor en un único HTML autocontenido."""
import os
D = os.path.dirname(os.path.abspath(__file__))
r = lambda f: open(os.path.join(D, f), encoding='utf-8').read()
out = [r('shell.html'), '\n<script>\n' + r('three.min.js') + '\n</script>\n']
for f in ('model.js', 'build.js', 'app.js'):
    out.append('<script>\n' + r(f) + '\n</script>\n')
out.append('<script>init();</script>\n')
dst = os.path.join(D, 'piso-b-3d.html')
open(dst, 'w', encoding='utf-8').write(''.join(out))
print(dst, round(os.path.getsize(dst) / 1e6, 3), 'MB')
