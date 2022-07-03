import * as THREE from "three"

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
// import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';

// import { setup } from "./setup"

// var { scene, camera, renderer } = setup;

export class HFTAARenderPass extends TAARenderPass {
    constructor(scene, camera, clearColor, clearAlpha) {

        super(scene, camera, clearColor, clearAlpha);

        // this.sampleLevel = 0;
        // this.accumulate = false;

    }

    render(renderer, writeBuffer, readBuffer, deltaTime) {

        if (this.accumulate === false) {

            // TAARenderPass.prototype.render(renderer, writeBuffer, readBuffer, deltaTime); // maybe this is problematic because super now refers to just taarenderpass
            // super.render(renderer, writeBuffer, readBuffer, deltaTime);
            SSAARenderPass.prototype.render.call(this,renderer, writeBuffer, readBuffer, deltaTime);

            // console.log(TAARenderPass.prototype);
            this.accumulateIndex = - 1;
            return;

        }

        const jitterOffsets = _JitterVectors[5];

        if (this.sampleRenderTarget === undefined) {
            // console.log("params",this.params);
            this.sampleRenderTarget = new THREE.WebGLRenderTarget(readBuffer.width, readBuffer.height, { type: THREE.HalfFloatType });
            // this.sampleRenderTarget = new THREE.WebGLRenderTarget(readBuffer.width, readBuffer.height);
            this.sampleRenderTarget.texture.name = 'TAARenderPass.sample';

        }

        if (this.holdRenderTarget === undefined) {

            this.holdRenderTarget = new THREE.WebGLRenderTarget(readBuffer.width, readBuffer.height, { type: THREE.HalfFloatType });
            // this.holdRenderTarget = new THREE.WebGLRenderTarget(readBuffer.width, readBuffer.height);
            this.holdRenderTarget.texture.name = 'TAARenderPass.hold';

        }

        if (this.accumulateIndex === - 1) {

            // TAARenderPass.prototype.render(renderer, this.holdRenderTarget, readBuffer, deltaTime);
            // super.render(renderer, this.holdRenderTarget, readBuffer, deltaTime);
            SSAARenderPass.prototype.render.call(this,renderer, this.holdRenderTarget, readBuffer, deltaTime);

            this.accumulateIndex = 0;

        }

        const autoClear = renderer.autoClear;
        renderer.autoClear = false;

        const sampleWeight = 1.0 / (jitterOffsets.length);

        if (this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length) {

            this.copyUniforms['opacity'].value = sampleWeight;
            this.copyUniforms['tDiffuse'].value = writeBuffer.texture;

            // render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
            const numSamplesPerFrame = Math.pow(2, this.sampleLevel);
            for (let i = 0; i < numSamplesPerFrame; i++) {

                const j = this.accumulateIndex;
                const jitterOffset = jitterOffsets[j];

                if (this.camera.setViewOffset) {

                    this.camera.setViewOffset(readBuffer.width, readBuffer.height,
                        jitterOffset[0] * 0.0625, jitterOffset[1] * 0.0625, // 0.0625 = 1 / 16
                        readBuffer.width, readBuffer.height);

                }

                renderer.setRenderTarget(writeBuffer);
                renderer.clear();
                renderer.render(this.scene, this.camera);

                renderer.setRenderTarget(this.sampleRenderTarget);
                if (this.accumulateIndex === 0) renderer.clear();
                this.fsQuad.render(renderer);

                this.accumulateIndex++;

                if (this.accumulateIndex >= jitterOffsets.length) break;

            }

            if (this.camera.clearViewOffset) this.camera.clearViewOffset();

        }

        const accumulationWeight = this.accumulateIndex * sampleWeight;

        if (accumulationWeight > 0) {

            this.copyUniforms['opacity'].value = 1.0;
            this.copyUniforms['tDiffuse'].value = this.sampleRenderTarget.texture;
            renderer.setRenderTarget(writeBuffer);
            renderer.clear();
            this.fsQuad.render(renderer);

        }

        if (accumulationWeight < 1.0) {

            this.copyUniforms['opacity'].value = 1.0 - accumulationWeight;
            this.copyUniforms['tDiffuse'].value = this.holdRenderTarget.texture;
            renderer.setRenderTarget(writeBuffer);
            if (accumulationWeight === 0) renderer.clear();
            this.fsQuad.render(renderer);

        }

        renderer.autoClear = autoClear;

    }
}

export class HFSSAARenderPass extends SSAARenderPass {
    constructor(scene, camera, clearColor, clearAlpha) {

        super(scene, camera, clearColor, clearAlpha);

        // this.sampleLevel = 0;
        // this.accumulate = false;

    }

    render(renderer, writeBuffer, readBuffer) {

        if (!this.sampleRenderTarget) {

            this.sampleRenderTarget = new THREE.WebGLRenderTarget(readBuffer.width, readBuffer.height, { type: THREE.HalfFloatType });
            // this.sampleRenderTarget = new WebGLRenderTarget(readBuffer.width, readBuffer.height);
            this.sampleRenderTarget.texture.name = 'SSAARenderPass.sample';

        }

        const jitterOffsets = _JitterVectors[Math.max(0, Math.min(this.sampleLevel, 5))];

        const autoClear = renderer.autoClear;
        renderer.autoClear = false;

        renderer.getClearColor(this._oldClearColor);
        const oldClearAlpha = renderer.getClearAlpha();

        const baseSampleWeight = 1.0 / jitterOffsets.length;
        const roundingRange = 1 / 32;
        this.copyUniforms['tDiffuse'].value = this.sampleRenderTarget.texture;

        const viewOffset = {

            fullWidth: readBuffer.width,
            fullHeight: readBuffer.height,
            offsetX: 0,
            offsetY: 0,
            width: readBuffer.width,
            height: readBuffer.height

        };

        const originalViewOffset = Object.assign({}, this.camera.view);

        if (originalViewOffset.enabled) Object.assign(viewOffset, originalViewOffset);

        // render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
        for (let i = 0; i < jitterOffsets.length; i++) {

            const jitterOffset = jitterOffsets[i];

            if (this.camera.setViewOffset) {

                this.camera.setViewOffset(

                    viewOffset.fullWidth, viewOffset.fullHeight,

                    viewOffset.offsetX + jitterOffset[0] * 0.0625, viewOffset.offsetY + jitterOffset[1] * 0.0625, // 0.0625 = 1 / 16

                    viewOffset.width, viewOffset.height

                );

            }

            let sampleWeight = baseSampleWeight;

            if (this.unbiased) {

                // the theory is that equal weights for each sample lead to an accumulation of rounding errors.
                // The following equation varies the sampleWeight per sample so that it is uniformly distributed
                // across a range of values whose rounding errors cancel each other out.

                const uniformCenteredDistribution = (- 0.5 + (i + 0.5) / jitterOffsets.length);
                sampleWeight += roundingRange * uniformCenteredDistribution;

            }

            this.copyUniforms['opacity'].value = sampleWeight;
            renderer.setClearColor(this.clearColor, this.clearAlpha);
            renderer.setRenderTarget(this.sampleRenderTarget);
            renderer.clear();
            renderer.render(this.scene, this.camera);

            renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);

            if (i === 0) {

                renderer.setClearColor(0x000000, 0.0);
                renderer.clear();

            }

            this.fsQuad.render(renderer);

        }

        if (this.camera.setViewOffset && originalViewOffset.enabled) {

            this.camera.setViewOffset(

                originalViewOffset.fullWidth, originalViewOffset.fullHeight,

                originalViewOffset.offsetX, originalViewOffset.offsetY,

                originalViewOffset.width, originalViewOffset.height

            );

        } else if (this.camera.clearViewOffset) {

            this.camera.clearViewOffset();

        }

        renderer.autoClear = autoClear;
        renderer.setClearColor(this._oldClearColor, oldClearAlpha);

    }
}

const _JitterVectors = [
    [
        [0, 0]
    ],
    [
        [4, 4], [- 4, - 4]
    ],
    [
        [- 2, - 6], [6, - 2], [- 6, 2], [2, 6]
    ],
    [
        [1, - 3], [- 1, 3], [5, 1], [- 3, - 5],
        [- 5, 5], [- 7, - 1], [3, 7], [7, - 7]
    ],
    [
        [1, 1], [- 1, - 3], [- 3, 2], [4, - 1],
        [- 5, - 2], [2, 5], [5, 3], [3, - 5],
        [- 2, 6], [0, - 7], [- 4, - 6], [- 6, 4],
        [- 8, 0], [7, - 4], [6, 7], [- 7, - 8]
    ],
    [
        [- 4, - 7], [- 7, - 5], [- 3, - 5], [- 5, - 4],
        [- 1, - 4], [- 2, - 2], [- 6, - 1], [- 4, 0],
        [- 7, 1], [- 1, 2], [- 6, 3], [- 3, 3],
        [- 7, 6], [- 3, 6], [- 5, 7], [- 1, 7],
        [5, - 7], [1, - 6], [6, - 5], [4, - 4],
        [2, - 3], [7, - 2], [1, - 1], [4, - 1],
        [2, 1], [6, 2], [0, 4], [4, 4],
        [2, 5], [7, 5], [5, 6], [3, 7]
    ]
];