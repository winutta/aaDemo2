varying vec3 pos;
varying vec2 vUV;
varying vec3 n;
// uniform mat3 normalMatrix;

void main()
{
	vUV = uv;

	n = normal;

	vec3 offset = vec3(0.);

	vec4 modelPosition = (modelMatrix*vec4(position,1.));
	modelPosition.xyz += offset;
	pos = modelPosition.xyz; //World Position

	vec4 modelViewPosition = viewMatrix*modelPosition;
	gl_Position = projectionMatrix * modelViewPosition;

}