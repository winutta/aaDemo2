import * as THREE from "three"
import {setup} from "./setup"
import {EXRLoader} from "three/examples/jsm/loaders/EXRLoader"
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader"
import {HDRCubeTextureLoader} from "three/examples/jsm/loaders/HDRCubeTextureLoader"
// import 

import vertShader from "./shaders/sphere/vertShader.glsl"
import fragShader from "./shaders/sphere/fragShader.glsl"

var {scene,renderer} = {...setup};

var sphereGeometry = new THREE.SphereGeometry(1,100.,100.);
// var sphereGeometry = new THREE.PlaneGeometry(1,1,100.,100.);

var params = {
    texture: null
}

var sphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
        iTime: {value: 0},
        tex: {value: null},
        envCube: {type: "t", value: null},
    },
    vertexShader: vertShader,
    fragmentShader: fragShader,
    // transparent: true
});

sphereMaterial.extensions.shaderTextureLOD = true;


var sphereMesh = new THREE.Mesh(sphereGeometry,sphereMaterial);
sphereMesh.scale.set(10,10,10);
// sphereMesh.position.set(0, 0, 6);

scene.add(sphereMesh);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileCubemapShader();
// pmremGenerator.compileEquirectangularShader();

var exrCubeRenderTarget, exrBackground
new EXRLoader()
    .load("./piz.exr", function(texture,textureData){
        console.log("texture", texture);
        // console.log("textureData", textureData);

        // console.log("encoding", texture.encoding);
        // console.log("linear", THREE.LinearEncoding);
        // console.log("sRGB", THREE.sRGBEncoding);
        // console.log(pmremGenerator);

        texture.generateMipmaps = true;
        // texture.encoding = THREE.sRGBEncoding;

        exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
        exrBackground = exrCubeRenderTarget.texture;

        // exrBackground.encoding = THREE.LinearEncoding;

        // texture.needsUpdate = true;
        // texture.needsPMREMUpdate = true;

        exrBackground.needsPMREMUpdate = true;
        // exrBackground.needsUpdate = true;

        // console.log("uvmap",THREE.UVMapping);
        console.log("cubemap",exrCubeRenderTarget,exrCubeRenderTarget.texture);


        // texture.encoding = THREE.sRGBEncoding;

        // sphereMaterial.uniforms.tex.value = texture;
        sphereMaterial.uniforms.tex.value = exrBackground;
        // sphereMaterial.uniforms.envCube.value = exrBackground;
        // sphereMaterial.needsUpdate = true;

        texture.dispose();

    });


var loader = new DDSLoader();
var src = 'https://threejs.org/examples/textures/compressed/Mountains_argb_mip.dds'
loader.load(src, function (texture) {
    console.log(texture); //How it should look.
    // texture.mapping = THREE.CubeReflectionMapping;
    console.log("format", THREE.RGBAFormat); //what this is using
    sphereMaterial.uniforms.envCube.value = texture;
    });

var hdrCubeMap, hdrCubeRenderTarget;


const hdrUrls = ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'];
hdrCubeMap = new HDRCubeTextureLoader()
    .setPath('./cubemap/')
    .load(hdrUrls, function () {

        // hdrCubeRenderTarget = pmremGenerator.fromCubemap(hdrCubeMap);
        // hdrCubeMap.encoding = THREE.sRGBEncoding;
        // hdrCubeMap.magFilter = THREE.LinearFilter;
        // hdrCubeMap.generateMipmaps = true;
        // hdrCubeMap.needsUpdate = true;
        // console.log(hdrCubeMap);
        // console.log(hdrCubeRenderTarget.texture);
        // sphereMaterial.uniforms.envCube.value = hdrCubeMap; 
    });