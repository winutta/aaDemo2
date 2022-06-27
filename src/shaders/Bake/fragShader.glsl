
varying vec3 pos;
varying vec2 vUV;
varying vec3 n;

uniform float iTime;
uniform sampler2D tex;

uniform float minV;
uniform float maxV;
uniform float valueV;
uniform float gammaV;

uniform vec2 tiling;
uniform vec2 offset;

vec3 decodeRGBE(vec4 rgbe){

  vec3 c = rgbe.rgb;
  float expon = rgbe.a;

  float m = pow(2.,expon*255. - 128.)/255.;
  vec3 co = c*m;

  return co;

}

vec3 GammaToLinearSpace (vec3 sRGB)
{
    // Approximate version from http://chilliant.blogspot.com.au/2012/08/srgb-approximations-for-hlsl.html?m=1
    return sRGB * (sRGB * (sRGB * 0.305306011 + 0.682171111) + 0.012522878);

    // Precise version, useful for debugging.
    //return half3(GammaToLinearSpaceExact(sRGB.r), GammaToLinearSpaceExact(sRGB.g), GammaToLinearSpaceExact(sRGB.b));
}

vec3 gamma(vec3 c){
  return pow(c,vec3(1./2.2));
}

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

  vec2 texUV = vUV*tiling + offset;

  vec4 exr = texture(tex,texUV);

  float val = exr.r;
  val = clamp(val,0.,1.);

  // val = GammaToLinearSpace(val);
  // val = pow(val,2.2);
  val = clamp((val-minV)/(maxV-minV),0.,1.);
  float mixV = mix(val,1.,1.-valueV);
  mixV = clamp(mixV,0.,1.);
  float result = pow(mixV,1./gammaV);
  // col = exr.rgb;
  col = vec3(result);
  // col = gamma(col);
  col = LinearToGammaSpace(col);
  // col = vec3(exr.a);


  gl_FragColor = vec4(col,1.);
}