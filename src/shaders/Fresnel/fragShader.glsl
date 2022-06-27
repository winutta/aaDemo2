
varying vec3 pos;
varying vec2 vUV;
varying vec3 n;

// uniform float iTime;
// uniform sampler2D tex;

uniform float IOR;
uniform float facing;
uniform float edge;

// vec3 gamma(vec3 c){
//   return pow(c,vec3(1./2.2));
// }

vec3 LinearToGammaSpace (vec3 linRGB)
{
    linRGB = max(linRGB, vec3(0., 0., 0.));
    // An almost-perfect approximation from http://chilliant.blogspot.com.au/2012/08/srgb-approximations-for-hlsl.html?m=1
    return max(1.055 * pow(linRGB, vec3(0.416666667)) - 0.055, vec3(0.));

    // Exact version, useful for debugging.
    // return vec3(LinearToGammaSpaceExact(linRGB.r), LinearToGammaSpaceExact(linRGB.g), LinearToGammaSpaceExact(linRGB.b));
}

void main() {
  vec3 col = vec3(1.,0.,1.);

  vec3 nN = vec3(n.xy,-n.z);

  vec3 viewDir = normalize(pos*1.-cameraPosition);
  viewDir = vec3(viewDir.xy,-viewDir.z);
  float NoV = dot(nN,-viewDir);
  float fresnel = pow(1.-NoV,IOR);
  float mixResult = mix(facing,edge,fresnel);

  col = vec3(mixResult);

  // col = gamma(col); //this isnt called for by the shader in unity but it looks closer with it. otherwise I have to multiply pos to get closer to center
  //maybe im missing something else?
  // col = n;
  // col = vec3(fresnel);
  // col = vec3(NoV);

  // vec3 exr = texture2D(tex,vUV).rgb;
  // col = exr;

  col = LinearToGammaSpace(col);

  gl_FragColor = vec4(col,1.);
}