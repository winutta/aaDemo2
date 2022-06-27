
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
uniform sampler2D tex7;

uniform samplerCube cube0;
uniform samplerCube cube1;
uniform samplerCube cube2;
uniform samplerCube cube3;
uniform samplerCube cube4;
uniform samplerCube cube5;
uniform samplerCube cube6;
uniform samplerCube cube7;
// uniform samplerCube envCube;

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




void main() {
  vec3 col = vec3(1.,0.,1.);

  //Should I just use the pano instead and get uvs from refl?

  vec3 viewDirection = (pos - cameraPosition);

  vec3 refl = reflect(normalize(viewDirection), normalize(n));
  refl = vec3(refl.x,refl.y,refl.z); //this seems to match unity (minus z values)

  refl = rot(refl,vec3(0.,1.,0.), PI/2. );

  vec3 hdr0 = texture2D(tex0,vUV).rgb;
  vec3 hdr1 = texture2D(tex1,vUV).rgb;
  vec3 hdr2 = texture2D(tex2,vUV).rgb;
  vec3 hdr3 = texture2D(tex3,vUV).rgb;
  vec3 hdr4 = texture2D(tex4,vUV).rgb;
  vec3 hdr5 = texture2D(tex5,vUV).rgb;
  vec3 hdr6 = texture2D(tex6,vUV).rgb;
  vec3 hdr7 = texture2D(tex7,vUV).rgb;


  vec3 dir = normalize(pos);

  dir = refl;
  // dir = 
  vec3 cu0 = textureCube(cube0,dir).rgb;
  vec3 cu1 = textureCube(cube1,dir).rgb;
  vec3 cu2 = textureCube(cube2,dir).rgb;
  vec3 cu3 = textureCube(cube3,dir).rgb;
  vec3 cu4 = textureCube(cube4,dir).rgb;
  vec3 cu5 = textureCube(cube5,dir).rgb;
  vec3 cu6 = textureCube(cube6,dir).rgb;
  vec3 cu7 = textureCube(cube7,dir).rgb;

  // cu0 = gamma(cu0);
  // cu1 = gamma(cu1);
  // cu2 = gamma(cu2);
  // cu3 = gamma(cu3);
  // cu4 = gamma(cu4);
  // cu5 = gamma(cu5);
  // cu6 = gamma(cu6);
  // cu7 = gamma(cu7);

  // col = mix(hdr0,hdr1,gloss);
  // col = hdr7;
  // col = cu5;

  float rough = (1.-gloss);
  float perRough = rough*(1.7-0.7*rough);
  float mipLevel = perRough*7.;

  // mipLevel = gloss*7.;

  // float mipLevel = pow((1.-gloss),1.)*7.;
  float fracMip = fract(mipLevel);

  vec3 lowerMip = vec3(0.);
  vec3 upperMip = vec3(0.);

  // lowerMip = cu0;

  // if(mipLevel < 1.){
  //   //mip0
  //   lowerMip = hdr0;
  //   upperMip = hdr1;
  // } 
  
  // if(mipLevel > 1. && mipLevel < 2.){
  //   // mip1
  //   lowerMip = hdr1;
  //   upperMip = hdr2;
  // }

  // if(mipLevel > 2. && mipLevel < 3.){
  //   // mip2
  //   lowerMip = hdr2;
  //   upperMip = hdr3;
  // }

  // if(mipLevel > 3. && mipLevel < 4.){
  //   // mip2
  //   lowerMip = hdr3;
  //   upperMip = hdr4;
  // }
  
  // if(mipLevel > 4. && mipLevel < 5.){
  //   // mip2
  //   lowerMip = hdr4;
  //   upperMip = hdr5;
  // }
  
  //   if(mipLevel > 5. && mipLevel < 6.){
  //   // mip2
  //   lowerMip = hdr5;
  //   upperMip = hdr6;
  // }

  //   if(mipLevel > 6.){
  //   // mip2
  //   lowerMip = hdr6;
  //   upperMip = hdr7;
  // }

  // if(mipLevel >= 7.){
  //   fracMip = 1.;
  // }

  // if(mipLevel <= 0.){
  //   fracMip = 0.;
  // }

  // ---------------------
  if(mipLevel >= 7.){
    fracMip = 1. + mipLevel-7.;
  }

  if(mipLevel <= 0.){
    fracMip = 0.;
  }


  if(mipLevel < 1.){
    //mip0
    lowerMip = cu0;
    upperMip = cu1;
  } 
  
  if(mipLevel >= 1. && mipLevel < 2.){
    // mip1
    lowerMip = cu1;
    upperMip = cu2;
  }

  if(mipLevel >= 2. && mipLevel < 3.){
    // mip2
    lowerMip = cu2;
    upperMip = cu3;
  }

  if(mipLevel >= 3. && mipLevel < 4.){
    // mip2
    lowerMip = cu3;
    upperMip = cu4;
  }
  
  if(mipLevel >= 4. && mipLevel < 5.){
    // mip2
    lowerMip = cu4;
    upperMip = cu5;
  }
  
    if(mipLevel >= 5. && mipLevel < 6.){
    // mip2
    lowerMip = cu5;
    upperMip = cu6;
  }

    if(mipLevel >= 6.){
    // mip2
    lowerMip = cu6;
    upperMip = pow(cu7,vec3(1./(1.+fracMip*0.3)))+fracMip*0.035*0.;
  }

  //   if(mipLevel >= 7.){
  //   // mip2
  //   lowerMip = cu7;
  //   upperMip = cu7;
  // }



  col = mix(lowerMip,upperMip, fracMip);

  //   if(mipLevel > 7. && mipLevel < 8.){
  //   // mip2
  //   lowerMip = hdr7;
  //   upperMip = hdr8;
  // }

  // vec3 viewDirection = (pos - cameraPosition);

  // vec3 refl = reflect(normalize(viewDirection), normalize(n));
  // refl = vec3(refl.x,refl.y,refl.z); //this seems to match unity (minus z values)

  // refl = rot(refl,vec3(0.,1.,0.), PI/2. );

  // vec4 cube = textureCube(envCube,refl,0.);

  // col = cube.rgb;
  col = gamma(vec3(col));
  // col = pow(col,vec3(1./2.2));

  // col = refl;


  gl_FragColor = vec4(col,1.);
}