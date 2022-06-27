import * as THREE from "three"
import {setup} from "./setup"

import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader"
import { RGBMLoader } from "three/examples/jsm/loaders/RGBMLoader"
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader"
import {EXRLoader} from "three/examples/jsm/loaders/EXRLoader"
// import * as mikktspace from "three/examples/jsm/libs/mikktspace.module.js"
// import * as bufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils"
// console.log(mikktspace);

import * as dat from 'dat.gui'
// import 

// import vertShader from "./shaders/sphere/vertShader.glsl"
// import fragShader from "./shaders/sphere/fragShader.glsl"

//Maybe do this in a seperate file to be more organized

import carPaintVert from "./shaders/carPaint/vertShader.glsl"
import carPaintFrag from "./shaders/carPaint/fragShader.glsl"

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

import planeVert from "./shaders/hdr/vertShader.glsl"
import planeFrag from "./shaders/hdr/fragShader.glsl"

var {scene,renderer,gui} = {...setup};

var sphereGeometry = new THREE.SphereGeometry(1,100.,100.);
sphereGeometry.computeTangents();
console.log(sphereGeometry);
// mikktspace.ready.then(()=>{
//     sphereGeometry = bufferGeometryUtils.computeMikkTSpaceTangents(sphereGeometry,mikktspace,false);
//     console.log(sphereGeometry);
// });



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

var fbxLoader = new FBXLoader();
var gltfLoader = new GLTFLoader();
var PI = Math.PI;

function loadCar(material,meshHolder){

   return new Promise((resolve,reject) =>{
       gltfLoader.load(
        //    "./carPaint/BodyPanels.fbx",
        //    "./carPaint/car_panel_tangents.fbx",
           "./carPaint/car_panels.glb",
        function (model) {
        //    var mesh = model.children[0];
        var mesh = model.scene.children[0];
            console.log(model);
           mesh.material = material;
           var carPaintEmpty = new THREE.Group();

           carPaintEmpty.position.set(.8566546, 4.113441, -2.278141);
           carPaintEmpty.add(mesh);
           scene.add(carPaintEmpty);
           mesh.scale.set(0.03, 0.03, 0.03);//seems like scale is 1/100th.??? why
           mesh.position.set(0., -5, 0.);
           mesh.rotation.set(1. * PI / 6, 0, 0);
           mesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 2 * PI / 12);
           mesh.visible = false;
           mesh.geometry.computeTangents();
            console.log(mesh.geometry);
           resolve(mesh);
       });
   }) 
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
    tex0: { value: null },
    tex1: {  value: null },
    tex2: {  value: null },
    tex3: {  value: null },
    tex4: {  value: null },
    tex5: {  value: null },
    tex6: {  value: null },
}

var reflectionNUniforms = {
    tiling: { value: new THREE.Vector2(10, 10) },
    offset: { value: new THREE.Vector2(0, 0) },
    tex0: { value: null },
    tex1: { value: null },
    tex2: { value: null },
    tex3: { value: null },
    tex4: { value: null },
    tex5: { value: null },
    tex6: { value: null },
    normTex: {value: null},
    valueV: {value: 0.683},
    gloss: {value: 0.377},
}

var planeUniforms = {
    tex0: {value: null}
}

var carPaintUniforms = {
    // Specular
    refl0: { value: null },
    refl1: { value: null },
    refl2: { value: null },
    refl3: { value: null },
    refl4: { value: null },
    refl5: { value: null },
    refl6: { value: null },
    // Bake
    bakeTex: {value: null},
    bakeTiling: {value: new THREE.Vector2(1,1)},
    bakeOffset: {value: new THREE.Vector2(0,0)},
    // Diffuse
    // - AO
    diffAOMin: {value: 0},
    diffAOMax: { value: 1 },
    diffAOVal: { value: 1 },
    diffAOGamma: { value: 1 },
    // - DiffTex
    diffTex: { value: null },
    diffTiling: { value: new THREE.Vector2(1, 1) },
    diffOffset: { value: new THREE.Vector2(0, 0) },
    // 
    diffTexMin: { value: 0 },
    diffTexMax: { value: 1 },
    diffTexVal: { value: 1 },
    diffTexGamma: { value: .29 },
    // 
    diffGlobal: {value: .45},
    // 
    diffDirectColor: { value: new THREE.Vector3(0.2311, 0.3473, 1.)},
    diffIndirectColor: { value: new THREE.Vector3(0.0485, 0., 0.4811) },
    // LCQR
    lcqrNormTex: { value: null },
    lcqrNormTiling: { value: new THREE.Vector2(50, 50) },
    lcqrNormOffset: { value: new THREE.Vector2(0, 0) },
    lcqrNormValue: {value: 0.5},
    // 
    lcqrGloss: {value: 1.},
    lcqrGamma: {value: 1.},
    //  
    lcqrAOMin: { value: 0 },
    lcqrAOMax: { value: 1 },
    lcqrAOVal: { value: 1 },
    lcqrAOGamma: { value: 1 },
    // 
    lcqrTex: { value: null },
    lcqrTiling: { value: new THREE.Vector2(5, 5) },
    lcqrOffset: { value: new THREE.Vector2(0, 0) },
    // 
    lcqrTexMin: { value: 0},
    lcqrTexMax: { value: 1 },
    lcqrTexVal: { value: 1 },
    lcqrTexGamma: { value: 1 },
    // 
    // Flake
    flakeNormTex: { value: null },
    flakeNormTiling: { value: new THREE.Vector2(80, 80) },
    flakeNormOffset: { value: new THREE.Vector2(0, 0) },
    flakeNormValue: { value: 0.5 },
    // 
    flakeGloss1: { value: .77 },
    flakeGloss2: { value: .7 },
    // 
    spec_12_mix: {value: 0.75},
    // 
    flakeColor: { value: new THREE.Vector3(0., 0.83, 1.)},
    // 
    flakeAOMin: { value: 0 },
    flakeAOMax: { value: 1 },
    flakeAOVal: { value: 1 },
    flakeAOGamma: { value: 1 },
    // 
    flakeDirectMin: { value: 0 },
    flakeDirectMax: { value: 1 },
    flakeDirectVal: { value: 1 },
    flakeDirectGamma: { value: 1 },
    // 
    flakeGlobal: {value: .49},
    // 
    // Lacquer Fresnel
    lcqrIOR: { value: 5.07 },
    lcqrFacing: { value: 0.0 },
    lcqrEdge: { value: 1. },
    // 
    globalMultiply: {value: 1.},
    globalGamma: {value: 1.},
}

//this is looking fairly nice, add a slider?
//maybe need to reexport panos from lys with 128x64 as the highest roughness.

// Create Materials and Meshes //
// --------------------------- //


var carPaintMaterial = createMaterial(carPaintVert,carPaintFrag,carPaintUniforms);
var carPaintMeshPromise = loadCar(carPaintMaterial);


function carPaintMesh(callback){
    carPaintMeshPromise.then((response)=> {
        callback(response);
    })
}
carPaintMesh((mesh)=>{mesh.visible = true;})

// May have to use an object to hold the mesh, or maybe i can just return the mesh from the function?? does that work?

var diffuseMaterial = createMaterial(diffuseVert, diffuseFrag, diffuseUniforms);
var diffuseMesh = createPlane(diffuseMaterial);

// diffuseMesh.visible = true;

var diffuseMMVGMaterial = createMaterial(diffuseMMVGVert, diffuseMMVGFrag, diffuseMMVGUniforms);
var diffuseMMVGMesh = createPlane(diffuseMMVGMaterial);

// diffuseMMVGMesh.visible = true;

var bakeMaterial = createMaterial(bakeVert, bakeFrag, bakeUniforms);
var bakeMesh = createPlane(bakeMaterial);

// bakeMesh.visible = true;

var reflectionMaterial = createMaterial(reflectionVert,reflectionFrag,reflectionUniforms);
var reflectionMesh = createSphere(reflectionMaterial);

// reflectionMesh.visible = true;

var reflectionNMaterial = createMaterial(reflectionNVert,reflectionNFrag,reflectionNUniforms);
var reflectionNMesh = createSphere(reflectionNMaterial);

// console.log("reflN",reflectionNMesh);

// reflectionNMesh.visible = true;

var fresnelMaterial = createMaterial(fresnelVert, fresnelFrag, fresnelUniforms);
var fresnelMesh = createSphere(fresnelMaterial);

// fresnelMesh.visible = true;

var planeMaterial = createMaterial(planeVert,planeFrag,planeUniforms);
var planeMesh = createPlane(planeMaterial);

// planeMesh.visible = true;




var meshes = [diffuseMesh, diffuseMMVGMesh, bakeMesh, reflectionMesh, reflectionNMesh, fresnelMesh];

// Add GUI for toggling and variable changing

// var gui = new dat.GUI();
// gui.close();

//  GUI


// May need to wait till the mesh is loaded to add the gui.




var guiCarPaint = gui.addFolder("carPaint");
carPaintMesh((mesh)=>{
    guiCarPaint.add(mesh, "visible");
    // guiCarPaint.add(carPaintMaterial.uniforms)
});

// Bake Texture

var guiBakeTexture = guiCarPaint.addFolder("Bake Texture");

guiBakeTexture.add(carPaintMaterial.uniforms.bakeTiling.value, "x", 0., 2., 0.1).name("Bake Tiling X");
guiBakeTexture.add(carPaintMaterial.uniforms.bakeTiling.value, "y", 0., 2., 0.1).name("Bake Tiling Y");
guiBakeTexture.add(carPaintMaterial.uniforms.bakeOffset.value, "x", 0., 2., 0.1).name("Bake Offset X");
guiBakeTexture.add(carPaintMaterial.uniforms.bakeOffset.value, "y", 0., 2., 0.1).name("Bake Offset Y");

// Diffuse

var guiDiffuse = guiCarPaint.addFolder("Diffuse Layer");

var guiDiffuseAO = guiDiffuse.addFolder("Diffuse AO");

guiDiffuseAO.add(carPaintMaterial.uniforms.diffAOMin, "value", 0., 1., 0.01).name("Diff AO Min");
guiDiffuseAO.add(carPaintMaterial.uniforms.diffAOMax, "value", 0., 1., 0.01).name("Diff AO Max");
guiDiffuseAO.add(carPaintMaterial.uniforms.diffAOVal, "value", 0., 1., 0.01).name("Diff AO Value");
guiDiffuseAO.add(carPaintMaterial.uniforms.diffAOGamma, "value", 0., 4., 0.01).name("Diff AO Gamma");

var guiDiffuseTex = guiDiffuse.addFolder("Diffuse Texture");

guiDiffuseTex.add(carPaintMaterial.uniforms.diffTexMin, "value", 0., 1., 0.01).name("Diff Tex Min");
guiDiffuseTex.add(carPaintMaterial.uniforms.diffTexMax, "value", 0., 1., 0.01).name("Diff Tex Max");
guiDiffuseTex.add(carPaintMaterial.uniforms.diffTexVal, "value", 0., 1., 0.01).name("Diff Tex Value");
guiDiffuseTex.add(carPaintMaterial.uniforms.diffTexGamma, "value", 0., 4., 0.01).name("Diff Tex Gamma");

guiDiffuse.add(carPaintMaterial.uniforms.diffGlobal, "value", 0., 2., 0.01).name("Diff Global");

var pallete = {
    diffDirectColor: [0,128,255],
    diffIndirectColor: [0,128,255],
    directR: carPaintMaterial.uniforms.diffDirectColor.value.x,
    directG: carPaintMaterial.uniforms.diffDirectColor.value.y,
    directB: carPaintMaterial.uniforms.diffDirectColor.value.z,
    indirectR: carPaintMaterial.uniforms.diffIndirectColor.value.x,
    indirectG: carPaintMaterial.uniforms.diffIndirectColor.value.y,
    indirectB: carPaintMaterial.uniforms.diffIndirectColor.value.z,
}



// guiDiffuse.addColor(pallete, "diffDirectColor").onChange(function(){
//     console.log(pallete.diffDirectColor[0]);
//     carPaintMaterial.uniforms.diffDirectColor.value.x = pallete.diffDirectColor[0]/255.;
//     carPaintMaterial.uniforms.diffDirectColor.value.y = pallete.diffDirectColor[1]/255.;
//     carPaintMaterial.uniforms.diffDirectColor.value.z = pallete.diffDirectColor[2]/255.;
// });

var guiDirectColor = guiDiffuse.addFolder("Direct Color");

guiDirectColor.add(pallete,"directR",0.,1.,0.01).onChange(function(){
    carPaintMaterial.uniforms.diffDirectColor.value.x = pallete.directR;
})

guiDirectColor.add(pallete, "directG", 0., 1., 0.01).onChange(function () {
    carPaintMaterial.uniforms.diffDirectColor.value.y = pallete.directG;
})

guiDirectColor.add(pallete, "directB", 0., 1., 0.01).onChange(function () {
    carPaintMaterial.uniforms.diffDirectColor.value.z = pallete.directB;
})

// guiDiffuse.addColor(pallete, "diffIndirectColor").onChange(function () {
//     // console.log(pallete.diffDirectColor[0]);
//     carPaintMaterial.uniforms.diffIndirectColor.value.x = pallete.diffIndirectColor[0] / 255.;
//     carPaintMaterial.uniforms.diffIndirectColor.value.y = pallete.diffIndirectColor[1] / 255.;
//     carPaintMaterial.uniforms.diffIndirectColor.value.z = pallete.diffIndirectColor[2] / 255.;
// });

var guiIndirectColor = guiDiffuse.addFolder("Indirect Color");

guiIndirectColor.add(pallete, "indirectR", 0., 1., 0.01).onChange(function () {
    carPaintMaterial.uniforms.diffIndirectColor.value.x = pallete.indirectR;
})

guiIndirectColor.add(pallete, "indirectG", 0., 1., 0.01).onChange(function () {
    carPaintMaterial.uniforms.diffIndirectColor.value.y = pallete.indirectG;
})

guiIndirectColor.add(pallete, "indirectB", 0., 1., 0.01).onChange(function () {
    carPaintMaterial.uniforms.diffIndirectColor.value.z = pallete.indirectB;
})



// Lacquer

var guiLacquer = guiCarPaint.addFolder("Lacquer Layer");

var guiLcqrNorm = guiLacquer.addFolder("Lacquer Norm Texture");

guiLcqrNorm.add(carPaintMaterial.uniforms.lcqrNormTiling.value, "x", 0., 80., 0.1).name("lcqrNorm Tiling X");
guiLcqrNorm.add(carPaintMaterial.uniforms.lcqrNormTiling.value, "y", 0., 80., 0.1).name("lcqrNorm Tiling Y");
guiLcqrNorm.add(carPaintMaterial.uniforms.lcqrNormOffset.value, "x", 0., 2., 0.1).name("lcqrNorm Offset X");
guiLcqrNorm.add(carPaintMaterial.uniforms.lcqrNormOffset.value, "y", 0., 2., 0.1).name("lcqrNorm Offset Y");

guiLcqrNorm.add(carPaintMaterial.uniforms.lcqrNormValue, "value", 0., 2., 0.01).name("lcqrNorm Value");

var guiLcqrSpecular = guiLacquer.addFolder("Lacquer Specular");

guiLcqrSpecular.add(carPaintMaterial.uniforms.lcqrGloss, "value", 0., 1., 0.01).name("lcqr Gloss");
guiLcqrSpecular.add(carPaintMaterial.uniforms.lcqrGamma, "value", 0., 2., 0.01).name("lcqr Gamma");

var guiLcqrAO = guiLacquer.addFolder("Lacquer AO");

guiLcqrAO.add(carPaintMaterial.uniforms.lcqrAOMin, "value", 0., 1., 0.01).name("lcqr AO Min");
guiLcqrAO.add(carPaintMaterial.uniforms.lcqrAOMax, "value", 0., 1., 0.01).name("lcqr AO Max");
guiLcqrAO.add(carPaintMaterial.uniforms.lcqrAOVal, "value", 0., 1., 0.01).name("lcqr AO Value");
guiLcqrAO.add(carPaintMaterial.uniforms.lcqrAOGamma, "value", 0., 4., 0.01).name("lcqr AO Gamma");

var guiLcqrTex = guiLacquer.addFolder("Lacquer Tex");

guiLcqrTex.add(carPaintMaterial.uniforms.lcqrTiling.value, "x", 0., 10., 0.1).name("lcqr Tiling X");
guiLcqrTex.add(carPaintMaterial.uniforms.lcqrTiling.value, "y", 0., 10., 0.1).name("lcqr Tiling Y");
guiLcqrTex.add(carPaintMaterial.uniforms.lcqrOffset.value, "x", 0., 2., 0.1).name("lcqr Offset X");
guiLcqrTex.add(carPaintMaterial.uniforms.lcqrOffset.value, "y", 0., 2., 0.1).name("lcqr Offset Y");

guiLcqrTex.add(carPaintMaterial.uniforms.lcqrTexMin, "value", 0., 1., 0.01).name("lcqr Tex Min");
guiLcqrTex.add(carPaintMaterial.uniforms.lcqrTexMax, "value", 0., 1., 0.01).name("lcqr Tex Max");
guiLcqrTex.add(carPaintMaterial.uniforms.lcqrTexVal, "value", 0., 1., 0.01).name("lcqr Tex Value");
guiLcqrTex.add(carPaintMaterial.uniforms.lcqrTexGamma, "value", 0., 4., 0.01).name("lcqr Tex Gamma");

// Flake

var guiFlake = guiCarPaint.addFolder("Flake Layer");

var guiFlakeNorm = guiFlake.addFolder("Flake Norm Texture");

guiFlakeNorm.add(carPaintMaterial.uniforms.flakeNormTiling.value, "x", 0., 80., 0.1).name("flakeNorm Tiling X");
guiFlakeNorm.add(carPaintMaterial.uniforms.flakeNormTiling.value, "y", 0., 80., 0.1).name("flakeNorm Tiling Y");
guiFlakeNorm.add(carPaintMaterial.uniforms.flakeNormOffset.value, "x", 0., 10., 0.1).name("flakeNorm Offset X");
guiFlakeNorm.add(carPaintMaterial.uniforms.flakeNormOffset.value, "y", 0., 10., 0.1).name("flakeNorm Offset Y");

guiFlakeNorm.add(carPaintMaterial.uniforms.flakeNormValue, "value", 0., 2., 0.01).name("flakeNorm Value");

var guiFlakeSpecular = guiFlake.addFolder("Flake Specular");

guiFlakeSpecular.add(carPaintMaterial.uniforms.flakeGloss1, "value", 0., 1., 0.01).name("flake Gloss 1");
guiFlakeSpecular.add(carPaintMaterial.uniforms.flakeGloss2, "value", 0., 1., 0.01).name("flake Gloss 2");

guiFlakeSpecular.add(carPaintMaterial.uniforms.spec_12_mix, "value", 0., 1., 0.01).name("Mix gloss 1 and 2");

var guiFlakeAO = guiFlake.addFolder("Flake AO");

guiFlakeAO.add(carPaintMaterial.uniforms.flakeAOMin, "value", 0., 1., 0.01).name("flake AO Min");
guiFlakeAO.add(carPaintMaterial.uniforms.flakeAOMax, "value", 0., 1., 0.01).name("flake AO Max");
guiFlakeAO.add(carPaintMaterial.uniforms.flakeAOVal, "value", 0., 1., 0.01).name("flake AO Value");
guiFlakeAO.add(carPaintMaterial.uniforms.flakeAOGamma, "value", 0., 4., 0.01).name("flake AO Gamma");

var guiFlakeDirect = guiFlake.addFolder("Flake Direct");

guiFlakeDirect.add(carPaintMaterial.uniforms.flakeDirectMin, "value", 0., 1., 0.01).name("flake Direct Min");
guiFlakeDirect.add(carPaintMaterial.uniforms.flakeDirectMax, "value", 0., 1., 0.01).name("flake Direct Max");
guiFlakeDirect.add(carPaintMaterial.uniforms.flakeDirectVal, "value", 0., 1., 0.01).name("flake Direct Value");
guiFlakeDirect.add(carPaintMaterial.uniforms.flakeDirectGamma, "value", 0., 4., 0.01).name("flake Direct Gamma");

guiFlake.add(carPaintMaterial.uniforms.flakeGlobal, "value", 0., 2., 0.01).name("flake Global");

var guiFlakeColor = guiFlake.addFolder("Flake Color");

var pallete2 = {
    flakeColor: [0, 128, 255],
    flakeR: carPaintMaterial.uniforms.flakeColor.value.x,
    flakeG: carPaintMaterial.uniforms.flakeColor.value.y,
    flakeB: carPaintMaterial.uniforms.flakeColor.value.z,
}

guiFlakeColor.add(pallete2, "flakeR", 0., 1., 0.01).onChange(function () {
    carPaintMaterial.uniforms.flakeColor.value.x = pallete2.flakeR;
})

guiFlakeColor.add(pallete2, "flakeG", 0., 1., 0.01).onChange(function () {
    carPaintMaterial.uniforms.flakeColor.value.y = pallete2.flakeG;
})

guiFlakeColor.add(pallete2, "flakeB", 0., 1., 0.01).onChange(function () {
    carPaintMaterial.uniforms.flakeColor.value.z = pallete2.flakeB;
})

// Lacquer Fresnel

var guiLacquerFresnel = guiCarPaint.addFolder("Lacquer Fresnel Layer");

guiLacquerFresnel.add(carPaintMaterial.uniforms.lcqrFacing, "value", 0., 1., 0.01).name("lcqr Facing");
guiLacquerFresnel.add(carPaintMaterial.uniforms.lcqrEdge, "value", 0., 1., 0.01).name("lcqr Edge");
guiLacquerFresnel.add(carPaintMaterial.uniforms.lcqrIOR, "value", 0., 10., 0.01).name("lcqr IOR");

// Combine

var guiCombine = guiCarPaint.addFolder("Combine Layers");

guiCombine.add(carPaintMaterial.uniforms.globalMultiply, "value", 0., 2., 0.01).name("Global Multiply");
guiCombine.add(carPaintMaterial.uniforms.globalGamma, "value", 0., 2., 0.01).name("Global Gamma");

// guiCarPaint.add(carPaintMaterial.uniforms.flakeGamma, "value", 0., 2., 0.01).name("flake Gamma");





var guiIndividualMaterials = gui.addFolder("Individual Materials");

var guiDiffuse = guiIndividualMaterials.addFolder("Diffuse");
// guiDiffuse.open();
guiDiffuse.add(diffuseMesh, "visible");
guiDiffuse.add(diffuseMaterial.uniforms.tiling.value,"x",0.,2.,0.1).name("Tiling X");
guiDiffuse.add(diffuseMaterial.uniforms.tiling.value, "y", 0., 2., 0.1).name("Tiling Y");
guiDiffuse.add(diffuseMaterial.uniforms.offset.value, "x", 0., 2., 0.1).name("Offset X");
guiDiffuse.add(diffuseMaterial.uniforms.offset.value, "y", 0., 2., 0.1).name("Offset Y");

var guiDiffuseMMVG = guiIndividualMaterials.addFolder("DiffuseMMVG");
// guiDiffuseMMVG.open();
guiDiffuseMMVG.add(diffuseMMVGMesh, "visible");
guiDiffuseMMVG.add(diffuseMMVGMaterial.uniforms.tiling.value, "x", 0., 2., 0.1).name("Tiling X");
guiDiffuseMMVG.add(diffuseMMVGMaterial.uniforms.tiling.value, "y", 0., 2., 0.1).name("Tiling Y");
guiDiffuseMMVG.add(diffuseMMVGMaterial.uniforms.offset.value, "x", 0., 2., 0.1).name("Offset X");
guiDiffuseMMVG.add(diffuseMMVGMaterial.uniforms.offset.value, "y", 0., 2., 0.1).name("Offset Y");
guiDiffuseMMVG.add(diffuseMMVGMaterial.uniforms.minV, "value", 0.,1., 0.01).name("Min");
guiDiffuseMMVG.add(diffuseMMVGMaterial.uniforms.maxV, "value", 0., 1., 0.01).name("Max");
guiDiffuseMMVG.add(diffuseMMVGMaterial.uniforms.valueV, "value", 0., 1., 0.01).name("Value");
guiDiffuseMMVG.add(diffuseMMVGMaterial.uniforms.powerV, "value", 0., 4., 0.01).name("Power");

var guiBake = guiIndividualMaterials.addFolder("Bake");
// guiBake.open();
guiBake.add(bakeMesh, "visible");
guiBake.add(bakeMaterial.uniforms.tiling.value, "x", 0., 2., 0.1).name("Tiling X");
guiBake.add(bakeMaterial.uniforms.tiling.value, "y", 0., 2., 0.1).name("Tiling Y");
guiBake.add(bakeMaterial.uniforms.offset.value, "x", 0., 2., 0.1).name("Offset X");
guiBake.add(bakeMaterial.uniforms.offset.value, "y", 0., 2., 0.1).name("Offset Y");
guiBake.add(bakeMaterial.uniforms.minV, "value", 0., 1., 0.01).name("Min");
guiBake.add(bakeMaterial.uniforms.maxV, "value", 0., 1., 0.01).name("Max");
guiBake.add(bakeMaterial.uniforms.valueV, "value", 0., 1., 0.01).name("Value");
guiBake.add(bakeMaterial.uniforms.gammaV, "value", 0., 4., 0.01).name("Gamma");

var guiReflection = guiIndividualMaterials.addFolder("Reflection");
guiReflection.open();
guiReflection.add(reflectionMesh, "visible");
guiReflection.add(reflectionMaterial.uniforms.gloss, "value", 0., 1., 0.001).name("gloss");

var guiReflectionN = guiIndividualMaterials.addFolder("ReflectionN");
// guiReflectionN.open();
guiReflectionN.add(reflectionNMesh, "visible");
guiReflectionN.add(reflectionNMaterial.uniforms.tiling.value, "x", 0., 20., 0.1).name("Tiling X");
guiReflectionN.add(reflectionNMaterial.uniforms.tiling.value, "y", 0., 20., 0.1).name("Tiling Y");
guiReflectionN.add(reflectionNMaterial.uniforms.offset.value, "x", 0., 2., 0.1).name("Offset X");
guiReflectionN.add(reflectionNMaterial.uniforms.offset.value, "y", 0., 2., 0.1).name("Offset Y");
guiReflectionN.add(reflectionNMaterial.uniforms.valueV, "value", 0., 1., 0.001).name("Value");
guiReflectionN.add(reflectionNMaterial.uniforms.gloss, "value", 0., 1., 0.001).name("Gloss");


var guiFresnel = guiIndividualMaterials.addFolder("Fresnel");
// guiFresnel.open();
guiFresnel.add(fresnelMesh, "visible");
guiFresnel.add(fresnelMaterial.uniforms.IOR, "value", 0., 10., 0.001).name("IOR");
guiFresnel.add(fresnelMaterial.uniforms.facing, "value", 0., 1., 0.001).name("FACING");
guiFresnel.add(fresnelMaterial.uniforms.edge, "value", 0., 1., 0.001).name("EDGE");




// TEXTURE LOADING AND ASSIGNING TO UNIFORMS //

var textureLoader = new THREE.TextureLoader();
var rgbeLoader = new RGBELoader();

console.log("encodings");
console.log("Linear", THREE.LinearEncoding);
console.log("sRGB", THREE.sRGBEncoding);

var exrLoader = new EXRLoader();

// Car Paint
// -----------------

// Bake texture
exrLoader.load("./carPaint/bake_body.exr",function(texture){
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // texture.minFilter = THREE.LinearMipmapNearestFilter; 
    // texture.minFilter = THREE.NearestFilter;

    carPaintMaterial.uniforms.bakeTex.value = texture;
});

function loadMipCarPaint(url, url2, material) {
    rgbeLoader.load("./hyundai_refl/mip" + url + ".hdr", function (texture) {
        // texture.minFilter = THREE.LinearMipmapNearestFilter; 
        texture.minFilter = THREE.NearestFilter;
        material.uniforms["refl" + url].value = texture;
    });
}

for (var i = 0; i < 7; i++) {
    loadMipCarPaint(i.toString(), (i - 1).toString(), carPaintMaterial);
}

textureLoader.load(
    "./flakeNorm.jpg",
    function(texture){
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipmapNearestFilter; 
        // texture.minFilter = THREE.NearestFilter;
        // texture.minFilter = THREE.LinearMipmapLinearFilter;
        // I think this needs to change because it is causing differences to the one in unity.
        // texture.minFilter = THREE.LinearFilter;
        // texture.minFilter = THREE.NearestMipmapLinearFilter;
        // texture.minFilter = THREE.NearestMipmapNearestFilter;
        carPaintMaterial.uniforms.flakeNormTex.value = texture;
    }
);


textureLoader.load(
    "./mottle.jpg",
    function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearMipmapNearestFilter; 
        carPaintMaterial.uniforms.lcqrTex.value = texture;
    }
);



// -----------------

// Other Materials

// Reflection & ReflectionN envMap mipmap levels (manually taken as texture uniforms to be interpolated)

function loadMip(url, url2, material, material2) {
        rgbeLoader.load("./reflection/mip" + url + ".hdr", function (texture) {
        
        material.uniforms["tex" + url].value = texture;
        material2.uniforms["tex" + url].value = texture;
    });
}

for (var i = 0; i < 7; i++) {
    loadMip(i.toString(), (i - 1).toString(), reflectionMaterial, reflectionNMaterial);
}


//Load for ReflectionN - normalMap

textureLoader.load("./orange_peel.jpg", function(texture){
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // texture.minFilter = THREE.LinearFilter;
    // texture.minFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapNearestFilter;
    // texture.minFilter = THREE.LinearMipMapLinearFilter;
    // texture.minFilter = THREE.NearestMipMapLinearFilter;
    // texture.minFilter = THREE.NearestMipMapNearestFilter;
    reflectionNMaterial.uniforms.normTex.value = texture;
    carPaintMaterial.uniforms.lcqrNormTex.value = texture; //For carpaintShader
});


//Load for Diffuse and DiffuseMMVG - diffuseMap png

textureLoader.load(
    "./diffuse.png",
    function(texture){
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipmapNearestFilter; 
    diffuseMesh.material.uniforms.tex.value = texture;
    diffuseMMVGMesh.material.uniforms.tex.value = texture;
});

// //Load for Bake - bakeMap exr could be tiff or hdr

rgbeLoader.load("./bake.hdr", function (texture){
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipmapNearestFilter;
    console.log("bake",texture);
    bakeMesh.material.uniforms.tex.value = texture;
});


// export { bakeMaterial, bakeMesh, diffuseMaterial, diffuseMesh, diffuseMMVGMaterial, diffuseMMVGMesh, fresnelMaterial, fresnelMesh, reflectionMaterial, reflectionMesh, reflectionNMaterial, reflectionNMesh }