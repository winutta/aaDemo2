
varying vec3 pos;
varying vec2 vUV;
varying vec3 n;

// uniform float iTime;
uniform float gloss;

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform sampler2D tex3;
uniform sampler2D tex4;
uniform sampler2D tex5;
uniform sampler2D tex6;

#define PI 3.14159265358979

vec3 decodeRGBE(vec4 rgbe){

  vec3 c = rgbe.rgb;
  float expon = rgbe.a;

  float m = pow(2.,expon*256. - 128.);
  vec3 co = c*m;

  return co;

}

vec4 LinearToRGBM(vec3 value){
    float maxRange = 6.0;
    float maxRGB = max(value.r, max(value.g, value.b));
    float M = clamp(maxRGB / maxRange, 0.0, 1.0);
    M = ceil(M * 255.0) / 255.0;
    return vec4(value.rgb / (M * maxRange), M);
}


mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rot(vec3 p,vec3 axis, float a){
  mat4 m = rotationMatrix(axis,a);
  return (m*vec4(p,1.)).xyz;
}

vec3 gamma(vec3 c){
  return pow(c,vec3(1./2.2));
}

float LinearToGammaSpaceExact (float value)
{
    if (value <= 0.0)
        return 0.0;
    else if (value <= 0.0031308)
        return 12.92 * value;
    else if (value < 1.0)
        return 1.055 * pow(value, 0.4166667) - 0.055;
    else
        return pow(value, 0.45454545);
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

  vec3 viewDirection = (pos - cameraPosition);
  viewDirection = vec3(viewDirection.xy,-viewDirection.z); 

  vec3 nN = vec3(n.xy,-n.z);

  vec3 refl = reflect(normalize(viewDirection), normalize(nN));
  refl = vec3(refl.x,refl.y,refl.z); 

  refl = rot(refl,vec3(0.,1.,0.), PI/2. );


  vec3 rd = refl;
  vec2 angles = vec2(atan(rd.z, rd.x) + PI, acos(-rd.y)) / vec2(2.0 * PI, PI);

  vec2 texUV = angles;

  vec4 hdr0 = texture2D(tex0,texUV).rgba;
  vec4 hdr1 = texture2D(tex1,texUV).rgba;
  vec4 hdr2 = texture2D(tex2,texUV).rgba;
  vec4 hdr3 = texture2D(tex3,texUV).rgba;
  vec4 hdr4 = texture2D(tex4,texUV).rgba;
  vec4 hdr5 = texture2D(tex5,texUV).rgba;
  vec4 hdr6 = texture2D(tex6,texUV).rgba;


  vec3 dir = normalize(pos);

  dir = refl;

  float rough = (1.-gloss);
  float a = 0.7;
  float perRough = rough*(1.+a-a*rough);
  float mipLevel = perRough*6.;

  float fracMip = fract(mipLevel);

  vec4 lowerMip = vec4(0.);
  vec4 upperMip = vec4(0.);


  // ---------------------
  if(mipLevel >= 6.){
    fracMip = 1.;
  }

  if(mipLevel <= 0.){
    fracMip = 0.;
  }

// ----------------


    if(mipLevel < 1.){
    //mip0
    lowerMip = hdr0;
    upperMip = hdr1;
  } 
  
  if(mipLevel >= 1. && mipLevel < 2.){
    // mip1
    lowerMip = hdr1;
    upperMip = hdr2;
  }

  if(mipLevel >= 2. && mipLevel < 3.){
    // mip2
    lowerMip = hdr2;
    upperMip = hdr3;
  }

  if(mipLevel >= 3. && mipLevel < 4.){
    // mip2
    lowerMip = hdr3;
    upperMip = hdr4;
  }
  
  if(mipLevel >= 4. && mipLevel < 5.){
    // mip2
    lowerMip = hdr4;
    upperMip = hdr5;
  }
  
    if(mipLevel >= 5.){
    // mip2
    lowerMip = hdr5;
    upperMip = hdr6;
  }

  vec4 f = mix(lowerMip,upperMip, fracMip);
  col = f.rgb;


  col = LinearToGammaSpace(col);
  // col = gamma(col);



  gl_FragColor = vec4(col,1.);
}