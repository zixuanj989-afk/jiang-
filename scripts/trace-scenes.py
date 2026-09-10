"""Preserve the original drawings as editable color-vector scene assets."""
from pathlib import Path
import subprocess
import sys
root=Path(__file__).resolve().parents[1]
for scene in ['dorm','canteen','class','library','court','pond']:
    subprocess.run([sys.executable,str(root/'scripts/trace.py'),str(root/f'art-source/{scene}.png'),str(root/f'dist/assets/{scene}-v3.svg')],check=True)
    print(scene,'vectorized')
