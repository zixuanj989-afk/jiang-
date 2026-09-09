import sys
import vtracer
import re

# Convert supplied / approved image assets into real editable colour paths.
# Tracing preserves existing detail; it does not claim to recover lost resolution.
vtracer.convert_image_to_svg_py(sys.argv[1], sys.argv[2], colormode='color',
    hierarchical='stacked', mode='spline', filter_speckle=2,
    color_precision=6, layer_difference=12, corner_threshold=65,
    length_threshold=3.5, max_iterations=10, splice_threshold=45,
    path_precision=2)
with open(sys.argv[2], 'r') as file:
    svg = file.read()
svg = re.sub(r'(<svg[^>]*width="(\d+)" height="(\d+)")', lambda m: m[1] + ' viewBox="0 0 ' + m[2] + ' ' + m[3] + '"', svg)
with open(sys.argv[2], 'w') as file:
    file.write(svg)
