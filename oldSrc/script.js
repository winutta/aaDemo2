import './style.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
// import vertShader from "./shaders/vertShader.glsl"
// import fragShader from "./shaders/fragShader.glsl"

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
// import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass.js';
// import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { HFTAARenderPass, HFSSAARenderPass } from "./postProcess"

import {setup} from "./setup"
// import "./object";
// import "./Objects";
import "./Objects_clean";
// 

// import { ssaaOverloadRender, taaOverloadRender } from "./postRenderFuncs";

function main() {

// BASIC SETUP

    var {scene,camera,renderer,gui} = setup;

    const size = renderer.getSize(new THREE.Vector2());
    var pixelRatio = renderer.getPixelRatio();

    var renderTarget = new THREE.WebGLRenderTarget(size.width * pixelRatio, size.height * pixelRatio, { type: THREE.HalfFloatType });

    var composer = new EffectComposer(renderer, renderTarget);
    // console.log(composer);

    // var taaRenderPass = new TAARenderPass(scene, camera);
    var taaRenderPass = new HFTAARenderPass(scene, camera);
    taaRenderPass.unbiased = false;
    taaRenderPass.enabled = false;

    composer.addPass(taaRenderPass);

    var ssaaRenderPass = new HFSSAARenderPass(scene,camera);
    // var ssaaRenderPass = new SSAARenderPass(scene, camera);
    ssaaRenderPass.sampleLevel = 2;
    // ssaaRenderPass.unbiased = true;
    ssaaRenderPass.enabled = false;
    composer.addPass(ssaaRenderPass);

    var renderPass = new RenderPass(scene, camera);
    // renderPass.enabled = false;
    composer.addPass(renderPass);

    var copyPass = new ShaderPass(CopyShader);
    composer.addPass(copyPass);

    var aaState = {
        aaAlgo: "None",

    }

    // var gui = new dat.GUI();

    var aaFolder = gui.addFolder("Anti Aliasing");
    aaFolder.open();

    // gui.add(taaRenderPass,"enabled").onChange();
    aaFolder.add(aaState,"aaAlgo",{TAA: "TAA", SSAA: "SSAA", None: "None"}).onChange(function(){
        var algo = aaState.aaAlgo;

        if(algo == "TAA"){
            taaRenderPass.enabled = true;
            ssaaRenderPass.enabled = false;
            renderPass.enabled = false;
        } else if (algo == "SSAA"){
            taaRenderPass.enabled = false;
            ssaaRenderPass.enabled = true;
            renderPass.enabled = false;
        } else if (algo == "None"){
            taaRenderPass.enabled = false;
            ssaaRenderPass.enabled = false;
            renderPass.enabled = true;
        }
    }).name("AA Algorithm");

    aaFolder.add(ssaaRenderPass,"sampleLevel",0,5,1).name("SSAA Sample Level");
    aaFolder.add(taaRenderPass, "sampleLevel", 0, 5, 1).name("TAA Sample Level");

    aaFolder.add(ssaaRenderPass, "unbiased").name("SSAA Unbiased");
    aaFolder.add(taaRenderPass, "unbiased").name("TAA Unbiased");




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

    requestAnimationFrame(render);

    index++;

    // if (Math.round(index / 180) % 2 === 0){
    //     // console.log("hi");
    //     if (taaRenderPass) taaRenderPass.accumulate = true;
    // } else {
    //     // console.log("bye");
    //     if (taaRenderPass) taaRenderPass.accumulate = false;
    // }

    if(index<100){
        
        if (taaRenderPass) taaRenderPass.accumulate = true;
    } else if (index<200){
        if (taaRenderPass) taaRenderPass.accumulate = false;
        // index = 0;
    } 
    else {
        index = 0;
        if (taaRenderPass) taaRenderPass.accumulate = false;
    }

    // if (index<10){
    //     if (taaRenderPass) taaRenderPass.accumulate = false;
    // } else {
    //     if (taaRenderPass) taaRenderPass.accumulate = true;
    // }

    
    // taaRenderPass.accumulate = true;
    composer.render();

    // renderer.render(scene,camera);
    
}

requestAnimationFrame ( render );

}

main();




