import * as THREE from "three"
import {setup} from "./setup"
import {EXRLoader} from "three/examples/jsm/loaders/EXRLoader"
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader"
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader"
import {HDRCubeTextureLoader} from "three/examples/jsm/loaders/HDRCubeTextureLoader"
import * as dat from 'dat.gui'
// import 

// import vertShader from "./shaders/sphere/vertShader.glsl"
// import fragShader from "./shaders/sphere/fragShader.glsl"

//Maybe do this in a seperate file to be more organized

import sphereInterpVert from "./shaders/sphereInterp/vertShader.glsl"
import sphereInterpFrag from "./shaders/sphereInterp/fragShader.glsl"

import panoInterpVert from "./shaders/panoInterp/vertShader.glsl"
import panoInterpFrag from "./shaders/panoInterp/fragShader.glsl"

import diffuseVert from "./shaders/Diffuse/vertShader.glsl"
import diffuseFrag from "./shaders/Diffuse/fragShader.glsl"

import diffuseMMVGVert from "./shaders/DiffuseMMVG/vertShader.glsl"
import diffuseMMVGFrag from "./shaders/DiffuseMMVG/fragShader.glsl"

import fresnelVert from "./shaders/Fresnel/vertShader.glsl"
import fresnelFrag from "./shaders/Fresnel/fragShader.glsl"

import reflectionVert from "./shaders/Reflection/vertShader.glsl"
import reflectionFrag from "./shaders/Reflection/fragShader.glsl"

import reflectionNVert from "./shaders/ReflectionN/vertShader.glsl"
import reflectionNFrag from "./shaders/ReflectionN/fragShader.glsl"

import bakeVert from "./shaders/Bake/vertShader.glsl"
import bakeFrag from "./shaders/Bake/fragShader.glsl"

var {scene,renderer} = {...setup};

var sphereGeometry = new THREE.SphereGeometry(1,100.,100.);
var planeGeometry = new THREE.PlaneGeometry(1,1,100,100);

function createSphere(material){
    var mesh = new THREE.Mesh(sphereGeometry,material);
    mesh.scale.set(5,5,5);

    mesh.visible = false;
    scene.add(mesh);
    return mesh;
}

function createPlane(material){
    var mesh = new THREE.Mesh(planeGeometry, material);
    mesh.scale.set(10,10,10);
    mesh.visible = false;
    scene.add(mesh);
    return mesh;
}

//Materials:
// Bake, Diffuse, DiffuseMMVG, Fresnel, Reflection, ReflectionN

function createMaterial(vertShader,fragShader, uniforms){
    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertShader,
        fragmentShader: fragShader,
        // transparent: true
    });

    return material;
}

var bakeUniforms = {
    minV: {value: 0.},
    maxV: {value: 1.},
    valueV: {value: 1.},
    gammaV: {value: 1.},
    tiling: {value: new THREE.Vector2(1,1)},
    offset: {value: new THREE.Vector2(0.,0.)},
    tex: {value: null},
}

var diffuseUniforms = {
    tiling: { value: new THREE.Vector2(1, 1) },
    offset: { value: new THREE.Vector2(0, 0) },
    tex: { value: null },
}

var diffuseMMVGUniforms = {
    tiling: { value: new THREE.Vector2(1, 1) },
    offset: { value: new THREE.Vector2(0, 0) },
    tex: { value: null },
    minV: { value: 0. },
    maxV: { value: 1. },
    valueV: { value: 1 },
    powerV: { value: 1 },
}

var fresnelUniforms = {
    IOR: {value: 1.7},
    facing: { value: 0. },
    edge: { value: 0.208 },
}

var reflectionUniforms = {
    gloss: {value: 1.},
    envCube: {type: "t", value: null },
}

var reflectionNUniforms = {
    tiling: { value: new THREE.Vector2(1, 1) },
    offset: { value: new THREE.Vector2(0, 0) },
    envCube: {type: "t", value: null },
    normTex: {value: null},
    value: {value: 0.683},
    gloss: {value: 0.377},
}

var panoInterpUniforms = {
    gloss: {value: 5.},
    tex0: { value: "t", value: null},
    tex1: { value: "t", value: null },
    tex2: { value: "t", value: null },
    tex3: { value: "t", value: null },
    tex4: { value: "t", value: null },
    tex5: { value: "t", value: null },
    tex6: { value: "t", value: null },
    tex7: { value: "t", value: null },
    cube0: { value: "t", value: null },
    cube1: { value: "t", value: null },
    cube2: { value: "t", value: null },
    cube3: { value: "t", value: null },
    cube4: { value: "t", value: null },
    cube5: { value: "t", value: null },
    cube6: { value: "t", value: null },
    cube7: { value: "t", value: null },
    // tex0: { value: "t", value: null },
    // tex0: { value: "t", value: null },
}

var sphereInterpUniforms = {
    gloss: { value: 1. },
    tex0: { value: "t", value: null },
    tex1: { value: "t", value: null },
    tex2: { value: "t", value: null },
    tex3: { value: "t", value: null },
    tex4: { value: "t", value: null },
    tex5: { value: "t", value: null },
    tex6: { value: "t", value: null },
    tex7: { value: "t", value: null },
    cube0: { value: "t", value: null },
    cube1: { value: "t", value: null },
    cube2: { value: "t", value: null },
    cube3: { value: "t", value: null },
    cube4: { value: "t", value: null },
    cube5: { value: "t", value: null },
    cube6: { value: "t", value: null },
    cube7: { value: "t", value: null },
    // tex0: { value: "t", value: null },
    // tex0: { value: "t", value: null },
}

//this is looking fairly nice, add a slider?
//maybe need to reexport panos from lys with 128x64 as the highest roughness.

var sphereInterpMaterial = createMaterial(sphereInterpVert, sphereInterpFrag, sphereInterpUniforms);
var sphereInterpMesh = createSphere(sphereInterpMaterial);

sphereInterpMesh.visible = true;

var panoInterpMaterial = createMaterial(panoInterpVert,panoInterpFrag,panoInterpUniforms);
var panoInterpMesh = createPlane(panoInterpMaterial);

// panoInterpMesh.visible = true;

var bakeMaterial = createMaterial(bakeVert,bakeFrag,bakeUniforms);
var bakeMesh = createPlane(bakeMaterial);

// bakeMesh.visible = true;

var diffuseMaterial = createMaterial(diffuseVert,diffuseFrag,diffuseUniforms);
var diffuseMesh = createPlane(diffuseMaterial);

// diffuseMesh.visible = true;

var diffuseMMVGMaterial = createMaterial(diffuseMMVGVert,diffuseMMVGFrag,diffuseMMVGUniforms);
var diffuseMMVGMesh = createPlane(diffuseMMVGMaterial);

// diffuseMMVGMesh.visible = true;

var fresnelMaterial = createMaterial(fresnelVert,fresnelFrag,fresnelUniforms);
var fresnelMesh = createSphere(fresnelMaterial);

// fresnelMesh.visible = true;

var reflectionMaterial = createMaterial(reflectionVert,reflectionFrag,reflectionUniforms);
var reflectionMesh = createSphere(reflectionMaterial);

// reflectionMesh.visible = true;

var reflectionNMaterial = createMaterial(reflectionNVert,reflectionNFrag,reflectionNUniforms);
var reflectionMesh = createSphere(reflectionNMaterial);


var gui = new dat.GUI();

gui.add(sphereInterpMaterial.uniforms.gloss, "value", 0.,1.,0.001);


//How do I want to handle texture loading and giving them to materials?
//Could just put it right here below. Might be good to better organize it.

var textureLoader = new THREE.TextureLoader();
var exrLoader = new EXRLoader();
var rgbeLoader = new RGBELoader();
var ddsLoader = new DDSLoader();

//seems to work, now try with cubemap.

// function loadMip(url,url2,material,material2){

//     rgbeLoader.load("./fromLys/panorama_mipmaps/mip"+url+".hdr",function(texture){

//         var squareWidth = texture.source.data.width/4.;
//         console.log("square width",squareWidth);
//         var cubeRenderTarget = new THREE.WebGLCubeRenderTarget(squareWidth);
//         cubeRenderTarget.fromEquirectangularTexture(renderer, texture);
//         var cubeTex = cubeRenderTarget.texture;

//         material.uniforms["cube"+url2].value = cubeTex; 
//         material2.uniforms["cube" + url2].value = cubeTex; 

//         console.log("mip",texture,cubeTex); //cubeTex has updatepmrem  to true so maybe its mipmaps are being generated???
//         material.uniforms["tex"+url2].value = texture;
//         material2.uniforms["tex" + url2].value = texture;
//         console.log(material);
//     });
// }


// for(var i = 1;i<9;i++){
//     // console.log()
//     loadMip(i.toString(),(i-1).toString(), panoInterpMaterial,sphereInterpMaterial);
// }

// function loadMip2(url, url2, material, material2) {

//     rgbeLoader.load("./fromLys/panos11_6/mip" + url + ".hdr", function (texture) {

//         var squareWidth = texture.source.data.width / 4.;
//         console.log("square width", squareWidth);
//         var cubeRenderTarget = new THREE.WebGLCubeRenderTarget(squareWidth);
//         cubeRenderTarget.fromEquirectangularTexture(renderer, texture);
//         var cubeTex = cubeRenderTarget.texture;

//         material.uniforms["cube" + url].value = cubeTex;
//         material2.uniforms["cube" + url].value = cubeTex;

//         console.log("mip", texture, cubeTex); //cubeTex has updatepmrem  to true so maybe its mipmaps are being generated???
//         material.uniforms["tex" + url].value = texture;
//         material2.uniforms["tex" + url].value = texture;
//         console.log(material);
//     });
// }


// for (var i = 0; i < 6; i++) {
//     // console.log()
//     loadMip2(i.toString(), (i - 1).toString(), panoInterpMaterial, sphereInterpMaterial);
// }

function loadMip3(url, url2, material, material2) {
    rgbeLoader.load("./fromLys/officialBurley8mips/mip" + url + ".hdr", function (texture) {

        var squareWidth = texture.source.data.width / 4./2.;
        console.log("square width", squareWidth);
        var cubeRenderTarget = new THREE.WebGLCubeRenderTarget(squareWidth);
        cubeRenderTarget.fromEquirectangularTexture(renderer, texture);
        var cubeTex = cubeRenderTarget.texture;

        material.uniforms["cube" + url].value = cubeTex;
        material2.uniforms["cube" + url].value = cubeTex;

        console.log("mip", texture, cubeTex); //cubeTex has updatepmrem  to true so maybe its mipmaps are being generated???
        material.uniforms["tex" + url].value = texture;
        material2.uniforms["tex" + url].value = texture;
        console.log(material);
    });
}


for (var i = 0; i < 8; i++) {
    // console.log()
    loadMip3(i.toString(), (i - 1).toString(), panoInterpMaterial, sphereInterpMaterial);
}





// rgbeLoader.load("./fromLys/panorama_mipmaps/mip1.hdr",function(texture){
//     panoInterpMaterial.uniforms.tex0.value = texture;
// });

// rgbeLoader.load("./fromLys/panorama_mipmaps/mip5.hdr", function (texture) {
//     panoInterpMaterial.uniforms.tex1.value = texture;
// });

// exrLoader.setDataType(THREE.HalfFloatType);
//Load for Diffuse and DiffuseMMVG - diffuseMap png
textureLoader.load("./diffuse.png",function(texture){
    diffuseMesh.material.uniforms.tex.value = texture;
    diffuseMMVGMesh.material.uniforms.tex.value = texture;
});

// //Load for Bake - bakeMap exr could be tiff or hdr
rgbeLoader.load("./bake.hdr", function (texture){
    // console.log(texture);
    bakeMesh.material.uniforms.tex.value = texture;
});

function mipmap(size, color) {

    const imageCanvas = document.createElement('canvas');
    const context = imageCanvas.getContext('2d');

    imageCanvas.width = imageCanvas.height = size;

    context.fillStyle = '#444';
    context.fillRect(0, 0, size, size);

    context.fillStyle = color;
    context.fillRect(0, 0, size / 2, size / 2);
    context.fillRect(size / 2, size / 2, size / 2, size / 2);
    return imageCanvas;

}

function mipmap2(width,height,tex) {

    const imageCanvas = document.createElement('canvas');
    const context = imageCanvas.getContext('2d');

    imageCanvas.width = width;
    imageCanvas.height = height;
    var img = tex.image;

    context.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    context.drawImage(img, 0, 0, 500, 500);
    return imageCanvas;

}

function mipmap3(width, height, tex) {

    const imageCanvas = document.createElement('canvas');
    const context = imageCanvas.getContext('2d');

    imageCanvas.width = width;
    imageCanvas.height = height;
    var img = tex.image.data;
    console.log(img);

    // const arr = new Uint8ClampedArray(40000);
    var arr = Uint8ClampedArray.from(img);

    // Iterate through every pixel
    // for (let i = 0; i < arr.length; i += 4) {
    //     arr[i + 0] = 0;    // R value
    //     arr[i + 1] = 190;  // G value
    //     arr[i + 2] = 0;    // B value
    //     arr[i + 3] = 255;  // A value
    // }

    console.log(arr);

    var imgData = new ImageData(arr,4096);

    context.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    // // context.drawImage(img, 0, 0, 500, 500);
    context.putImageData(imgData,0,0);
    return imageCanvas;

}

// maybe simply render to new canvas with renderer (maybe even new renderer)
// But then how do i get this to load quickly?





rgbeLoader.load("./porsche.hdr", function (texture) {
    console.log(texture);

    var map0 = texture;
    // console.log(texture);

    // var base = mipmap3(4096,2048,texture);
    // var canvTex = new THREE.CanvasTexture(base);
    // canvTex.mipmaps[0] = base;


    // bakeMesh.material.uniforms.tex.value = canvTex;
;

    rgbeLoader.load("./fromLys/panorama_mipmaps/mip7.hdr",function(texture2){
        // var dataArr = [map0.source.data,texture2.source.data];
        // dataArr.forEach((e,i)=>{
        //     e.data = new Uint8Array(e.data.buffer, e.data.byteOffset, e.data.byteLength);
        // });
        // console.log(dataArr);
        // map0.mipmaps[0] = texture2;
        // console.log("hi");
        // console.log(map0);
        // map0.source.data = [{
        //     format: 1023,
        //     height: 2048,
        //     width: 4096,
        //     mipmaps: dataArr,
        // }];
        // map0.minFilter = 1008;
        // map0.mipmaps = undefined;
        // map0.type = 1009;

        // texture2.needsUpdate = true;
        // texture.needsUpdate = true;
        // texture.mipmaps[0] = texture.image;
        // texture.mipmaps[1] = texture2.image;

        // bakeMesh.material.uniforms.tex.value = texture;
    });

    // bakeMesh.material.uniforms.tex.value = map0;
});



console.log("canvas",mipmap(64,"#0f0"));
// const blankCanvas = document.createElement('canvas')
// blankCanvas.width = 128
// blankCanvas.height = 128

// const texture1 = new THREE.CanvasTexture(blankCanvas)
// texture1.mipmaps[0] = mipmap(128, '#ff0000')
// texture1.mipmaps[1] = mipmap(64, '#00ff00')
// texture1.mipmaps[2] = mipmap(32, '#0000ff')
// texture1.mipmaps[3] = mipmap(16, '#880000')
// texture1.mipmaps[4] = mipmap(8, '#008800')
// texture1.mipmaps[5] = mipmap(4, '#000088')
// texture1.mipmaps[6] = mipmap(2, '#008888')
// texture1.mipmaps[7] = mipmap(1, '#880088')
// texture1.repeat.set(5, 5)
// texture1.wrapS = THREE.RepeatWrapping
// texture1.wrapT = THREE.RepeatWrapping

// bakeMesh.material.uniforms.tex.value = texture1;


//Pretty nice, a cubemap directly from an equirectangular texture, at any resolution I want.;

rgbeLoader.load("./porsche.hdr",function(texture){
    // console.log(texture);
    var cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512);
    cubeRenderTarget.fromEquirectangularTexture(renderer,texture);
    var cubeTex = cubeRenderTarget.texture;
    // cubeTex.mapping = THREE.CubeReflectionMapping;
    // console.log("cubetex",cubeRenderTarget.cubeTex);
    // reflectionMesh.material.uniforms.envCube.value = cubeTex;
    // reflectionMesh.material.uniforms.envCube.value = cubeTex;

    reflectionMaterial.uniforms.envCube.value = cubeTex; 
    // this only works when i do it to the actual material,
    // rather than the material on the mesh, strange.
});

// ddsLoader.load("./fromLys/porsche_cube_specular.dds",function(texture){
//     console.log("dds",texture);
//     reflectionMaterial.uniforms.envCube.value = texture;
// });

var loader = new DDSLoader();
var src = 'https://threejs.org/examples/textures/compressed/Mountains_argb_mip.dds';
// src = "./fromLys/porsche_legacy_from_gimp2.dds";
loader.load(src, function (texture) {
    console.log("out",texture); //How it should look.
    // texture.mapping = THREE.CubeReflectionMapping;
    console.log("format", THREE.RGBAFormat); //what this is using
    // reflectionMaterial.uniforms.envCube.value = texture;
});


var hdrCubeMap;
// reflectionMaterial.extensions.shaderTextureLOD = true;

const hdrUrls = ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'];
hdrCubeMap = new HDRCubeTextureLoader()
    .setPath('./cubemap/')
    .load(hdrUrls, function () {

        // hdrCubeRenderTarget = pmremGenerator.fromCubemap(hdrCubeMap);
        // hdrCubeMap.encoding = THREE.sRGBEncoding;
        // hdrCubeMap.magFilter = THREE.LinearFilter;
        // hdrCubeMap.generateMipmaps = true;
        // hdrCubeMap.needsUpdate = true;
        console.log("hdr cubemap",hdrCubeMap);
        // console.log(hdrCubeRenderTarget.texture);
        // reflectionMaterial.uniforms.envCube.value = hdrCubeMap;
    });

//Load for Reflection and ReflectionN - envMap exr could be dds, hdr

//Load for ReflectionN - normalMap
