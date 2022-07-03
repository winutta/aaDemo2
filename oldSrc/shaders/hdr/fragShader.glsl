
varying vec3 pos;
varying vec2 vUV;
varying vec3 n;

// uniform float iTime;
uniform float gloss;

uniform sampler2D tex0;

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

//   //Should I just use the pano instead and get uvs from refl?

//   vec3 viewDirection = (pos - cameraPosition);

//   vec3 refl = reflect(normalize(viewDirection), normalize(n));
//   refl = vec3(refl.x,refl.y,refl.z); //this seems to match unity (minus z values)

//   refl = rot(refl,vec3(0.,1.,0.), PI/2. );

//   // want to be able to sample these hdrs with refl, need angles
//   vec3 rd = refl;
//   vec2 angles = vec2(atan(rd.z, rd.x) + PI, acos(-rd.y)) / vec2(2.0 * PI, PI);

//   vec2 texUV = angles;

//   vec3 hdr0 = texture2D(tex0,texUV).rgb;
//   vec3 hdr1 = texture2D(tex1,texUV).rgb;
//   vec3 hdr2 = texture2D(tex2,texUV).rgb;
//   vec3 hdr3 = texture2D(tex3,texUV).rgb;
//   vec3 hdr4 = texture2D(tex4,texUV).rgb;
//   vec3 hdr5 = texture2D(tex5,texUV).rgb;
//   vec3 hdr6 = texture2D(tex6,texUV).rgb;
//   vec3 hdr7 = texture2D(tex7,texUV).rgb;


//   vec3 dir = normalize(pos);

//   dir = refl;
//   // dir = 
//   vec3 cu0 = textureCube(cube0,dir).rgb;
//   vec3 cu1 = textureCube(cube1,dir).rgb;
//   vec3 cu2 = textureCube(cube2,dir).rgb;
//   vec3 cu3 = textureCube(cube3,dir).rgb;
//   vec3 cu4 = textureCube(cube4,dir).rgb;
//   vec3 cu5 = textureCube(cube5,dir).rgb;
//   vec3 cu6 = textureCube(cube6,dir).rgb;
//   vec3 cu7 = textureCube(cube7,dir).rgb;

//   // cu0 = gamma(cu0).rgb;
//   // cu1 = gamma(cu1).rgb;
//   // cu2 = gamma(cu2).rgb;
//   // cu3 = gamma(cu3).rgb;
//   // cu4 = gamma(cu4).rgb;
//   // cu5 = gamma(cu5).rgb;
//   // cu6 = gamma(cu6).rgb;
//   // cu7 = gamma(cu7).rgb;

//   float rough = (1.-gloss);
//   float a = 0.7;
//   float perRough = rough*(1.+a-a*rough);
//   // perRough = rough*rough;
//   // perRough = rough;
//   float mipLevel = perRough*6.;

//   // mipLevel = gloss*7.;
//   float fracMip = fract(mipLevel);

//   vec3 lowerMip = vec3(0.);
//   vec3 upperMip = vec3(0.);

//   // lowerMip = cu0;

//   // ---------------------
//   // if(mipLevel >= 6.){
//   //   fracMip = 1.;
//   // }

//   // if(mipLevel <= 0.){
//   //   fracMip = 0.;
//   // }


//   // if(mipLevel < 1.){
//   //   //mip0
//   //   lowerMip = cu0;
//   //   upperMip = cu1;
//   // } 
  
//   // if(mipLevel >= 1. && mipLevel < 2.){
//   //   // mip1
//   //   lowerMip = cu1;
//   //   upperMip = cu2;
//   // }

//   // if(mipLevel >= 2. && mipLevel < 3.){
//   //   // mip2
//   //   lowerMip = cu2;
//   //   upperMip = cu3;
//   // }

//   // if(mipLevel >= 3. && mipLevel < 4.){
//   //   // mip2
//   //   lowerMip = cu3;
//   //   upperMip = cu4;
//   // }
  
//   // if(mipLevel >= 4. && mipLevel < 5.){
//   //   // mip2
//   //   lowerMip = cu4;
//   //   upperMip = cu5;
//   // }
  
//   //   if(mipLevel >= 5.){
//   //   // mip2
//   //   lowerMip = cu5;
//   //   upperMip = cu6;
//   // }

// // ----------------


//     if(mipLevel < 1.){
//     //mip0
//     lowerMip = hdr0;
//     upperMip = hdr1;
//   } 
  
//   if(mipLevel >= 1. && mipLevel < 2.){
//     // mip1
//     lowerMip = hdr1;
//     upperMip = hdr2;
//   }

//   if(mipLevel >= 2. && mipLevel < 3.){
//     // mip2
//     lowerMip = hdr2;
//     upperMip = hdr3;
//   }

//   if(mipLevel >= 3. && mipLevel < 4.){
//     // mip2
//     lowerMip = hdr3;
//     upperMip = hdr4;
//   }
  
//   if(mipLevel >= 4. && mipLevel < 5.){
//     // mip2
//     lowerMip = hdr4;
//     upperMip = hdr5;
//   }
  
//     if(mipLevel >= 5.){
//     // mip2
//     lowerMip = hdr5;
//     upperMip = hdr6;
//   }

//   col = mix(lowerMip,upperMip, fracMip);

  // Just look at each level, one at a time..

  // col = cu0;

  // col = hdr0;

  // vec3 viewDirection = (pos - cameraPosition);

  // vec3 refl = reflect(normalize(viewDirection), normalize(n));
  // refl = vec3(refl.x,refl.y,refl.z); //this seems to match unity (minus z values)

  // refl = rot(refl,vec3(0.,1.,0.), PI/2. );

  // vec4 cube = textureCube(envCube,refl,0.);

  vec3 hdr0 = texture2D(tex0,vUV).rgb;
// col = vec3(vUV.x);
  col = hdr0;
  // col = cube.rgb;
  // col = gamma(vec3(col));

  // col = vec3(0.5);
  
  // col = pow(col,vec3(1./2.2));

  // col = refl;


  gl_FragColor = vec4(col,1.);
}