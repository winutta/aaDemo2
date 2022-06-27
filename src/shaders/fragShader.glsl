
varying vec3 pos;
varying vec2 vUV;
varying vec3 n;

uniform float iTime;
uniform sampler2D tex;


void main() {
  vec3 col = vec3(1.,0.,1.);

  vec3 exr = texture2D(tex,vUV).rgb;
  col = exr;

  gl_FragColor = vec4(col,1.);
}