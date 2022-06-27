
varying vec3 pos;
varying vec2 vUV;
varying vec3 n;

uniform float iTime;
uniform sampler2D tex;

uniform vec2 tiling;
uniform vec2 offset;


void main() {
  vec3 col = vec3(1.,0.,1.);

  vec2 texUV = vUV*tiling + offset;

  // vec4 exr = texture(tex,texUV,0.);

  vec3 diff = texture2D(tex,texUV).rgb;
  col = diff;

  gl_FragColor = vec4(col,1.);
}