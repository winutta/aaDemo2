import './style.css'
import * as THREE from 'three'
// import * as dat from 'dat.gui'
// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
// import vertShader from "./shaders/vertShader.glsl"
// import fragShader from "./shaders/fragShader.glsl"

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
// import { SMAAShader } from 'three/examples/jsm/shaders/SMAAShader.js';

import {setup} from "./setup"
// import "./object";
// import "./Objects";
import "./Objects_clean";
// 

function main() {

// BASIC SETUP

var {scene,camera,renderer} = setup;

// Add postProcessing;

console.log(renderer);


// var composerW = document.
    var composerTarget = new THREE.WebGLRenderTarget(renderer.domElement.width * 2, renderer.domElement.height * 2, { type: THREE.HalfFloatType, format: THREE.RGBAFormat,encoding: THREE.sRGBEncoding });
    const target = new THREE.WebGLRenderTarget({
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding,
        // encoding: THREE.LinearEncoding,
        // type: THREE.FloatType
    });


var composer = new EffectComposer(renderer);
// console.log(composer);
composer.setPixelRatio( window.devicePixelRatio );

var smaaRenderPass = new SMAAPass(scene,camera);

var taaRenderPass = new TAARenderPass(scene,camera);
// taaRenderPass.sampleLevel = 0;
// taaRenderPass.enabled = true;
taaRenderPass.unbiased = true;
// console.log(taaRenderPass);
// taaRenderPass.accumulate = true;
var ssaaRenderPass = new SSAARenderPass(scene, camera);
// ssaaRenderPass.copyMaterial.blending =  THREE.NormalBlending;
// ssaaRenderPass.copyMaterial.blending = THREE.AdditiveBlending;
// ssaaRenderPass.copyMaterial.blending = THREE.SubtractiveBlending;
// ssaaRenderPass.copyMaterial.blending = THREE.MultiplyBlending;
// ssaaRenderPass.copyMaterial.blending = THREE.NoBlending;
// console.log(ssaaRenderPass);
// composer.addPass(ssaaRenderPass);
var renderPass = new RenderPass(scene, camera);
renderPass.enabled = false;
// composer.addPass(renderPass);
var copyPass = new ShaderPass(CopyShader);
// composer.addPass(copyPass);

// ssaaRenderPass.clearColor = 0x000000;
// ssaaRenderPass.clearAlpha = 0.;

// ssaaRenderPass.sampleLevel = 2.;
// ssaaRenderPass.clear = true;
// ssaaRenderPass.renderToScreen = true;
// console.log(ssaaRenderPass);
// ssaaRenderPass.unbiased = true;

// ssaaRenderPass.enabled = true;

// copyPass.enabled = true;
    // composer.addPass(ssaaRenderPass);
composer.addPass(taaRenderPass);
composer.addPass(renderPass);
composer.addPass(copyPass);

// composer.addPass(renderPass);
var gammaCorrection = new ShaderPass(GammaCorrectionShader);
    console.log(1 / window.innerWidth,window.innerWidth);
FXAAShader.uniforms.resolution.value.x = 1/window.innerWidth*2.;
FXAAShader.uniforms.resolution.value.y = 1 / window.innerHeight*2.;
var fxaa = new ShaderPass(FXAAShader);
// composer.addPass(ssaaRenderPass);
// var smaa = new ShaderPass(SMAAShader);
// composer.addPass(smaa);
// composer.addPass(fxaa);
// composer.addPass(gammaCorrection);
// composer.addPass(copyPass);
// composer.addPass(smaaRenderPass);

    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {

        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        composer.setSize(width, height);

    }

// RENDER LOOP

let index = 0;

function render(time)
{   

    index++;

    if (Math.round(index / 100) % 2 === 0){
        // console.log("hi");
        if (taaRenderPass) taaRenderPass.accumulate = true;
    } else {
        if (taaRenderPass) taaRenderPass.accumulate = false;
    }

    
    // taaRenderPass.accumulate = true;
    composer.render();

    // renderer.render(scene,camera);
    requestAnimationFrame ( render );
}

requestAnimationFrame ( render );

}

main();




