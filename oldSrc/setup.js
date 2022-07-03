import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'



export class Setup {
    constructor(){

        
        // DISABLE RIGHT CLICK

        document.addEventListener('contextmenu', event => event.preventDefault(), false);

        // SCENE SETUP

        var scene = new THREE.Scene();
        // scene.background = new THREE.Color(0x000000);

        // CAMERA SETUP

        var camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.3, 1000);
        camera.position.set(0,0,60);

        // RENDERER SETUP
        var targetCanvas = document.querySelector(".webgl");
        var renderer = new THREE.WebGLRenderer({
            canvas: targetCanvas, 
            // alpha: true,
            // premultipliedAlpha: false,
            // stencil: false,
            // preserveDrawingBuffer: false,
        });

        const size = renderer.getSize(new THREE.Vector2());
        var pixelRatio = renderer.getPixelRatio();
        var renderTarget = new THREE.WebGLRenderTarget(size.width * pixelRatio, size.height * pixelRatio, { type: THREE.HalfFloatType });
        

        renderer.setRenderTarget(renderTarget);
        // renderer.outputEncoding = THREE.sRGBEncoding;
        // renderer.autoClear = false;
        // renderer.autoClearColor = false;
        // renderer.autoClearStencil = false;

        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );

        // MOUSE SETUP

        var mouse = new THREE.Vector2();

        //ORBIT CONTROL SETUP

        const controls = new OrbitControls(camera, renderer.domElement);
        // controls.enableRotate = false;
        controls.update();

        // Add to instance

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.mouse = mouse;
        this.gui = new dat.GUI();

        // RESIZE

        // window.addEventListener('resize', onWindowResize, false);

        // function onWindowResize() {
        //     var width = window.innerWidth;
        //     var height = window.innerHeight;
        //     camera.aspect = width / height;
        //     camera.updateProjectionMatrix();
        //     renderer.setSize(width, height);
        // }
    }
    
}

var setup = new Setup();

function getWorldDimensions(depth = 8){
    var vFOVC = setup.camera.fov * Math.PI / 180;
    var h = 2 * Math.tan(vFOVC / 2) * (depth);
    var w = h * setup.camera.aspect;
    return {w:w,h:h};
}

export {setup, getWorldDimensions}











