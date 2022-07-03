
varying vec3 pos;
varying vec3 vPos;
varying vec2 vUV;
varying vec3 n;

uniform float iTime;
uniform sampler2D tex;
uniform samplerCube envCube;

vec3 gamma(vec3 c){
  return pow(c,vec3(1./2.2));
}


vec3 decodeRGBE(vec4 rgbe){

  vec3 c = rgbe.rgb;
  float expon = rgbe.a;

  float m = pow(2.,expon*256. - 128.);
  vec3 co = c*m;

  return co;

}


void main() {
  vec3 col = vec3(1.,0.,1.);

  vec4 exr = texture2D(tex,vUV,8.).rgba;
  // col = pow(exr.rgb,vec3(1./2.2));
  // col = exr.rgb;
  // exr.rgb = gamma(exr.rgb);
  col = decodeRGBE(exr);
  // col = gamma(col);


  vec3 viewDirection = (pos - cameraPosition);

  vec3 refl = reflect(normalize(viewDirection), normalize(n));
  refl = vec3(refl.x,refl.y,-refl.z); //this seems to match unity (minus z values)

  vec4 cube = textureCube(envCube,refl,0.);
  // cube = textureCube(envCube,n,8.);


  // col = vec3(cube.a);
  // cube.rgb = 
  // cube.rgb = gamma(cube.rgb);
  // col = decodeRGBE(cube);
  col = cube.rgb;
  col = gamma(col);
  // col = n;
  // col = pos;

  gl_FragColor = vec4(col,1.);
}