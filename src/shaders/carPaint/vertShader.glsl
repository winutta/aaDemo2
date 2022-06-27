varying vec3 pos;
varying vec2 vUV;
varying vec3 n;
varying vec3 tang;
varying vec3 bitang;
// uniform mat3 normalMatrix;

attribute vec3 tangent;

void main()
{
	vUV = uv;

	n = normalize(modelMatrix*vec4(normal,0.)).rgb;
	tang = normalize(modelMatrix*vec4(tangent,0.)).rgb;
	bitang = cross(n,tang).rgb;

	vec3 offset = vec3(0.);

	vec4 modelPosition = (modelMatrix*vec4(position,1.));
	modelPosition.xyz += offset;
	pos = modelPosition.xyz; //World Position

	vec4 modelViewPosition = viewMatrix*modelPosition;
	gl_Position = projectionMatrix * modelViewPosition;

}