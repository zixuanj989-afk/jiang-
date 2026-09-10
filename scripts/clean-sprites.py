"""Extract original character silhouettes from the generated checkerboard sheet.

User authorized programmatic transparency cleanup. Originals stay untouched.
The neutral checkerboard is flooded from each frame's perimeter; enclosed white
uniform regions stay opaque. Only the principal character component is retained.
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]
source = np.array(Image.open(ROOT / 'art-source/walk-clean-rgb.png').convert('RGB'))
xs = [25,180,337,491,641,789,944,1095,1254]
ys = [4,170,318,465,617,768,917,1069,1254]
clean = np.zeros((*source.shape[:2],4), dtype=np.uint8)
report = []
for row in range(8):
    for col in range(8):
        rgb = source[ys[row]:ys[row+1], xs[col]:xs[col+1]].copy()
        values = rgb.astype(np.int16)
        neutral = (values.max(2)-values.min(2) < 23) & (values.min(2) > 140)
        seed = np.zeros(neutral.shape, dtype=bool)
        seed[[0,-1],:] = neutral[[0,-1],:]
        seed[:,[0,-1]] = neutral[:,[0,-1]]
        background = ndi.binary_propagation(seed, mask=neutral)
        labels, n = ndi.label(~background)
        sizes = np.bincount(labels.ravel()); sizes[0] = 0
        mask = labels == sizes.argmax()
        # Discard detached islands without eroding the hands, hair or shoe outlines.
        alpha = (mask * 255).astype(np.uint8)
        rgba = np.dstack([rgb,alpha]); rgba[~mask,:3] = 0
        clean[ys[row]:ys[row+1],xs[col]:xs[col+1]] = rgba
        report.append(int(mask.sum()))
Image.fromarray(clean).save(ROOT / 'art-source/walk-cleaned.png')
assert len(report)==64 and min(report)>3000, report
print('Cleaned 64 silhouettes; retained pixel area range:',min(report),max(report))
