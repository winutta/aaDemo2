
varying vec3 pos;
varying vec2 vUV;
varying vec3 n;
varying vec3 tang;
varying vec3 bitang;
// Reflection Env Map

uniform sampler2D refl0;
uniform sampler2D refl1;
uniform sampler2D refl2;
uniform sampler2D refl3;
uniform sampler2D refl4;
uniform sampler2D refl5;
uniform sampler2D refl6;

// Bake

uniform vec2 bakeTiling;
uniform vec2 bakeOffset;
uniform sampler2D bakeTex;

// Diffuse

uniform float diffAOMin;
uniform float diffAOMax;
uniform float diffAOVal;
uniform float diffAOGamma;

uniform vec2 diffTiling;
uniform vec2 diffOffset;
uniform sampler2D diffTex;

uniform float diffTexMin;
uniform float diffTexMax;
uniform float diffTexVal;
uniform float diffTexGamma;

uniform float diffGlobal;

uniform vec3 diffDirectColor;
uniform vec3 diffIndirectColor;

// Lacquer

uniform vec2 lcqrNormTiling;
uniform vec2 lcqrNormOffset;
uniform sampler2D lcqrNormTex;
uniform float lcqrNormValue;

uniform float lcqrGloss;
uniform float lcqrGamma;

uniform float lcqrAOMin;
uniform float lcqrAOMax;
uniform float lcqrAOVal;
uniform float lcqrAOGamma;

uniform vec2 lcqrTiling;
uniform vec2 lcqrOffset;
uniform sampler2D lcqrTex;

uniform float lcqrTexMin;
uniform float lcqrTexMax;
uniform float lcqrTexVal;
uniform float lcqrTexGamma;

// Flake

uniform vec2 flakeNormTiling;
uniform vec2 flakeNormOffset;
uniform sampler2D flakeNormTex;
uniform float flakeNormValue;

uniform float flakeGloss1;
uniform float flakeGloss2;

uniform float spec_12_mix;

uniform vec3 flakeColor;

uniform float flakeAOMin;
uniform float flakeAOMax;
uniform float flakeAOVal;
uniform float flakeAOGamma;

uniform float flakeDirectMin;
uniform float flakeDirectMax;
uniform float flakeDirectVal;
uniform float flakeDirectGamma;

uniform float flakeGlobal;

// Lacquer Fresnel

uniform float lcqrFacing;
uniform float lcqrEdge;
uniform float lcqrIOR;

uniform float globalMultiply;
uniform float globalGamma;



#define PI 3.14159265358979

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

vec3 GammaToLinearSpace (vec3 sRGB)
{
    // Approximate version from http://chilliant.blogspot.com.au/2012/08/srgb-approximations-for-hlsl.html?m=1
    return sRGB * (sRGB * (sRGB * 0.305306011 + 0.682171111) + 0.012522878);

    // Precise version, useful for debugging.
    //return half3(GammaToLinearSpaceExact(sRGB.r), GammaToLinearSpaceExact(sRGB.g), GammaToLinearSpaceExact(sRGB.b));
}

vec3 MMVG(vec3 p, float minV,float maxV,float valueV,float powerV){
  // vec3 line = GammaToLinearSpace(p);
  vec3 val = clamp((p-minV)/(maxV-minV),0.,1.);
  vec3 mixV = mix(val,vec3(1.),1.-valueV);
  mixV = clamp(mixV,0.,1.);
  vec3 result = pow(mixV,vec3(1./powerV));
  return result;
}

vec2 textureUVfromNorm(vec3 nor){
    //  Calculate reflection 
  vec3 viewDirection = (pos - cameraPosition);
  viewDirection = vec3(viewDirection.xy,-viewDirection.z); // this is what was needed.

  vec3 refl = reflect(normalize(viewDirection), nor);
  refl = vec3(refl.x,refl.y,refl.z); //negating y works????

  // refl = rot(refl,vec3(1.,0.,0.), PI/1. ); //matches unity's 
  // refl = rot(refl,vec3(0.,0.,1.), 0.    );
  refl = rot(refl,vec3(0.,1.,0.), PI/2.    );

  // Calculate uv from spherical coords.

  vec3 rd = refl;
  vec2 angles = vec2(atan(rd.z, rd.x) + PI, acos(-rd.y)) / vec2(2.0 * PI, PI);

  vec2 texUV = angles;

 return texUV;
}

vec3 mipmapInterp(float gloss, vec4 tex0, vec4 tex1, vec4 tex2,  vec4 tex3, vec4 tex4, vec4 tex5, vec4 tex6 ){

  // Calculate mipmap level

  float rough = (1.-gloss);
  float perRough = rough*(1.7-0.7*rough);
  float mipLevel = perRough*6.;

  float fracMip = fract(mipLevel);

  // Select a lower and upper mipmaps to interpolate between.

  vec4 lowerMip = vec4(0.);
  vec4 upperMip = vec4(0.);

  // --------------

  if(mipLevel >= 6.){
    fracMip = 1.;
  }

  if(mipLevel <= 0.){
    fracMip = 0.;
  }

// ----------------

  if(mipLevel < 1.){
    //mip0
    lowerMip = tex0;
    upperMip = tex1;
  } 
  
  if(mipLevel > 1. && mipLevel < 2.){
    // mip1
    lowerMip = tex1;
    upperMip = tex2;
  }

  if(mipLevel > 2. && mipLevel < 3.){
    // mip2
    lowerMip = tex2;
    upperMip = tex3;
  }

  if(mipLevel > 3. && mipLevel < 4.){
    // mip2
    lowerMip = tex3;
    upperMip = tex4;
  }
  
  if(mipLevel > 4. && mipLevel < 5.){
    // mip2
    lowerMip = tex4;
    upperMip = tex5;
  }
  
    if(mipLevel >= 5.){
    // mip2
    lowerMip = tex5;
    upperMip = tex6;
  }


  // ---------------------

  // Interpolate Gloss Mipmaps
  
  vec4 f = mix(lowerMip,upperMip, fracMip);
  // col = f.rgb;
  return f.rgb;
}


//////////
// MAIN // 
//////////


void main() {
  vec3 col = vec3(0.,0.,1.);

  // Bake Texure // Indirect, Direct, AO
  // -------------------
  vec2 gltfUV = vec2(vUV.x,1.-vUV.y);

  vec2 bakeUV = gltfUV*bakeTiling + bakeOffset;
  // bakeUV = vec2(bakeUV.x,1.-bakeUV.y); 
  vec3 bakeRGB = texture2D(bakeTex,bakeUV).rgb;

  float indirect = bakeRGB.r;
  float direct = bakeRGB.g;
  float AO = bakeRGB.b;

  // ---------------------





  // Diffuse
  // ------------------------

  // Diff Lighting //Good!


  vec3 directCol = diffDirectColor;
  vec3 indirectCol = diffIndirectColor;

  // vec3 directCol = vec3(0.2311,0.3473,1.);
  // vec3 indirectCol = vec3(0.0485,0.,0.4811); //maybe its the colors that need to be taken to linear space??


  directCol = GammaToLinearSpace(directCol);
  indirectCol = GammaToLinearSpace(indirectCol);

  vec3 di = directCol*direct;
  vec3 indi = indirectCol*indirect;

  vec3 diffLight = di + indi;

  // col = diffLight;

  // AO MMVG //Good

  vec3 ao = vec3(AO);
  // ao = GammaToLinearSpace(ao);

  vec3 diffAO = MMVG(ao,diffAOMin,diffAOMax, diffAOVal, diffAOGamma);

  // Diff Tex MMVG // just white

  vec2 diffUV = gltfUV*diffTiling + diffOffset; 
  vec3 diffRGB = texture2D(diffTex,diffUV).rgb;
  diffRGB = vec3(1.); //remove this when diffTex actually exists
  diffRGB = GammaToLinearSpace(diffRGB);
  diffRGB = MMVG(diffRGB,diffTexMin,diffTexMax, diffTexVal, diffTexGamma);

  vec3 diff = diffLight*diffAO*diffRGB*diffGlobal; 

  // col = diff;

  // ----------------------------








  // Lacquer
  // --------------------

/////////////////////
  // Specular Part
////////////////
  // get normal map

  vec2 lcqrNormUV = gltfUV*lcqrNormTiling + lcqrNormOffset; 
  vec3 lcqrNormal = texture2D(lcqrNormTex,lcqrNormUV).rgb;

  // Scale normal map based on unity scaling.

  lcqrNormal = (lcqrNormal*2. - 1.); //using 3 and 1.5 instead of 2 and 1.5 helps to give the right look
  lcqrNormal.xyz *= lcqrNormValue*1.;
  lcqrNormal.z = sqrt(1.-clamp(dot(lcqrNormal.xy,lcqrNormal.xy),0.,1.));

  // Calculate world normal from tangent normal and normal map.
  vec3 nN = vec3(n.xy,-n.z);
  vec3 nTang = vec3(tang.xy,-tang.z);
  vec3 biTang = vec3(bitang.xy,-bitang.z);

  vec3 wsNormal = nTang*lcqrNormal.x + biTang*lcqrNormal.y + nN*lcqrNormal.z;
  lcqrNormal = wsNormal;
  // lcqrNormal = n;

  // col = lcqrNormal;

  // LCQR env tex mipmaps for roughness.

  vec2 lcqrEnvUV = textureUVfromNorm(lcqrNormal);

  vec4 lcqrMip0 = texture2D(refl0,lcqrEnvUV).rgba;
  vec4 lcqrMip1 = texture2D(refl1,lcqrEnvUV).rgba;
  vec4 lcqrMip2 = texture2D(refl2,lcqrEnvUV).rgba;
  vec4 lcqrMip3 = texture2D(refl3,lcqrEnvUV).rgba;
  vec4 lcqrMip4 = texture2D(refl4,lcqrEnvUV).rgba;
  vec4 lcqrMip5 = texture2D(refl5,lcqrEnvUV).rgba;
  vec4 lcqrMip6 = texture2D(refl6,lcqrEnvUV).rgba;

  vec3 lcqrSpecular = mipmapInterp(lcqrGloss,lcqrMip0,lcqrMip1,lcqrMip2,lcqrMip3,lcqrMip4,lcqrMip5,lcqrMip6);

  // col = lcqrSpecular;
  // col = lcqrMip0.rgb;
  // col = lcqrMip1.rgb;
  // col = lcqrMip2.rgb;
  // col = lcqrMip3.rgb;
  // col = lcqrMip4.rgb; //seems too g
  // col = lcqrMip5.rgb;
  // col = lcqrMip6.rgb;

  vec3 lcqrColor = vec3(1.);

  lcqrSpecular *= lcqrColor;

  lcqrSpecular = pow(lcqrSpecular, vec3(1./lcqrGamma));

  //  col = lcqrSpecular;

  // LCQR AO MMVG //This is correct when ao is in linear space (starts that way!)

  vec3 lcqrAO = MMVG(ao,lcqrAOMin,lcqrAOMax, lcqrAOVal, lcqrAOGamma);

  // col = lcqrAO;

  // LCQR Tex MMVG //This is correct!

  vec2 lcqrUV = gltfUV*lcqrTiling + lcqrOffset; 
  vec3 lcqrRGB = texture2D(lcqrTex,lcqrUV).rgb;
  lcqrRGB = GammaToLinearSpace(lcqrRGB);
  lcqrRGB = MMVG(lcqrRGB,lcqrTexMin,lcqrTexMax, lcqrTexVal, lcqrTexGamma);

  // col = lcqrRGB;

  vec3 lacquer = lcqrSpecular*lcqrAO*lcqrRGB; //This is good but lcqrSpecular breaks if no gloss = 1


  // col = lacquer;
  

  // --------------------








  // flake
  // ---------------------

  // Flakes use the same env tex as LCQR but sample with flakeNormal;

  vec2 flakeNormUV = gltfUV*flakeNormTiling + flakeNormOffset; 
  vec3 flakeNormal = texture2D(flakeNormTex,flakeNormUV).rgb;

  // col = flakeNormal;

    // Scale normal map based on unity scaling.

  flakeNormal = (flakeNormal*2. - 1.); //using 3 and 1.5 instead of 2 and 1. helps to give the right look
  flakeNormal.xyz *= flakeNormValue*1.;
  flakeNormal.z = sqrt(1.-clamp(dot(flakeNormal.xy,flakeNormal.xy),0.,1.));

  // col = flakeNormal;

  // col = nTang;
  // col = biTang;
  // col = vec3(n.y);
  

  flakeNormal = nTang*flakeNormal.x + biTang*flakeNormal.y + nN*flakeNormal.z;

  // flakeNormal = vec3(dot(nTang,flakeNormal),dot(biTang,flakeNormal),dot(nN,flakeNormal));
  vec3 xVals = vec3(nTang.x,biTang.x,nN.x);
  vec3 yVals = vec3(nTang.y,biTang.y,nN.y);
  vec3 zVals = vec3(nTang.z,biTang.z,nN.z);

  // flakeNormal = vec3(dot(flakeNormal,xVals),dot(flakeNormal,yVals),dot(flakeNormal,zVals));
  // flakeNormal = nTang*flakeNormal.x;
  // flakeNormal = biTang*flakeNormal.y;
  // flakeNormal = nN*flakeNormal.z;

  // col = vec3(flakeNormal);
  // col = vec3(flakeNormal.x);

  vec2 flakeEnvUV = textureUVfromNorm(flakeNormal);

  vec4 flakeMip0 = texture2D(refl0,flakeEnvUV).rgba;
  vec4 flakeMip1 = texture2D(refl1,flakeEnvUV).rgba;
  vec4 flakeMip2 = texture2D(refl2,flakeEnvUV).rgba;
  vec4 flakeMip3 = texture2D(refl3,flakeEnvUV).rgba;
  vec4 flakeMip4 = texture2D(refl4,flakeEnvUV).rgba;
  vec4 flakeMip5 = texture2D(refl5,flakeEnvUV).rgba;
  vec4 flakeMip6 = texture2D(refl6,flakeEnvUV).rgba;

  vec3 flakeSpecular1 = mipmapInterp(flakeGloss1,flakeMip0,flakeMip1,flakeMip2,flakeMip3,flakeMip4,flakeMip5,flakeMip6);
  vec3 flakeSpecular2 = mipmapInterp(flakeGloss2,flakeMip0,flakeMip1,flakeMip2,flakeMip3,flakeMip4,flakeMip5,flakeMip6);

  vec3 mixFlakeSpecular = mix(flakeSpecular1,flakeSpecular2,spec_12_mix);

  // vec3 flakeSpecularColor = vec3(0.,0.83,1.);
  vec3 flakeSpecularColor = flakeColor;
  flakeSpecularColor = GammaToLinearSpace(flakeSpecularColor);

  vec3 flakeSpecular = mixFlakeSpecular*flakeSpecularColor;

  // col = flakeSpecular1;
  // col = flakeMip6.rgb;
  // col = mixFlakeSpecular;

  // flakes AO MMVG //Good!

  vec3 flakesAO = MMVG(ao,flakeAOMin,flakeAOMax, flakeAOVal, flakeAOGamma);

  // col = flakesAO;

  // flake direct MMVG //Correct!

  vec3 flakeDirect = MMVG(vec3(direct),flakeDirectMin,flakeDirectMax, flakeDirectVal, flakeDirectGamma);

  // col = flakeDirect;

  vec3 flake = flakeSpecular*flakesAO*flakeDirect*flakeGlobal;

  // col = flake;
  
  // ---------------------









  // Lacquer Fresnel
  // ---------------------

  // need to use normal from orange_peel, imported in LCQR

    vec3 viewDir = normalize(pos*1.-cameraPosition);
    viewDir = vec3(viewDir.xy,-viewDir.z);
    float NoV = dot(lcqrNormal,-viewDir);
    float fresnelVal = pow(1.-NoV,lcqrIOR);
    float mixResult = mix(lcqrFacing,lcqrEdge,fresnelVal);

    vec3 fresnel = vec3(mixResult);

    // col = vec3(nN);
    // col = lcqrNormal;
    // col = fresnel;

    // col = vec3(NoV);

  // --------------------




  // Combine
  // -----------------

  vec3 specDiff = diff + flake;

  vec3 specDiff_lcqr_fresnel = mix(specDiff,lacquer, fresnel);

  vec3 combineMG = specDiff_lcqr_fresnel*globalMultiply;
  combineMG = pow(combineMG, vec3(1./globalGamma));


  col = combineMG;

  // -----------------

  //   // Linear to Gamma from unity's built in shader code  

  col = LinearToGammaSpace(col);
  // col = clamp(col,0.,1.);

  // col = pos;


  gl_FragColor = vec4(col,1.);
}