import {
    WebGLRenderTarget,
    HalfFloatType
} from "three"

// var ssaaOverloadRender = function(ssaaPass) {
//     ssaaPass.render = function (renderer, writeBuffer, readBuffer) {

//         if (!this.sampleRenderTarget) {

//             this.sampleRenderTarget = new WebGLRenderTarget(readBuffer.width, readBuffer.height, { type: HalfFloatType });
//             this.sampleRenderTarget.texture.name = 'SSAARenderPass.sample';

//         }

//         const jitterOffsets = _JitterVectors[Math.max(0, Math.min(this.sampleLevel, 5))];

//         const autoClear = renderer.autoClear;
//         renderer.autoClear = false;

//         renderer.getClearColor(this._oldClearColor);
//         const oldClearAlpha = renderer.getClearAlpha();

//         const baseSampleWeight = 1.0 / jitterOffsets.length;
//         const roundingRange = 1 / 32;
//         this.copyUniforms['tDiffuse'].value = this.sampleRenderTarget.texture;

//         const viewOffset = {

//             fullWidth: readBuffer.width,
//             fullHeight: readBuffer.height,
//             offsetX: 0,
//             offsetY: 0,
//             width: readBuffer.width,
//             height: readBuffer.height

//         };

//         const originalViewOffset = Object.assign({}, this.camera.view);

//         if (originalViewOffset.enabled) Object.assign(viewOffset, originalViewOffset);

//         // render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
//         for (let i = 0; i < jitterOffsets.length; i++) {

//             const jitterOffset = jitterOffsets[i];

//             if (this.camera.setViewOffset) {

//                 this.camera.setViewOffset(

//                     viewOffset.fullWidth, viewOffset.fullHeight,

//                     viewOffset.offsetX + jitterOffset[0] * 0.0625, viewOffset.offsetY + jitterOffset[1] * 0.0625, // 0.0625 = 1 / 16

//                     viewOffset.width, viewOffset.height

//                 );

//             }

//             let sampleWeight = baseSampleWeight;

//             if (this.unbiased) {

//                 // the theory is that equal weights for each sample lead to an accumulation of rounding errors.
//                 // The following equation varies the sampleWeight per sample so that it is uniformly distributed
//                 // across a range of values whose rounding errors cancel each other out.

//                 const uniformCenteredDistribution = (- 0.5 + (i + 0.5) / jitterOffsets.length);
//                 sampleWeight += roundingRange * uniformCenteredDistribution;

//             }

//             this.copyUniforms['opacity'].value = sampleWeight;
//             renderer.setClearColor(this.clearColor, this.clearAlpha);
//             renderer.setRenderTarget(this.sampleRenderTarget);
//             renderer.clear();
//             renderer.render(this.scene, this.camera);

//             renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);

//             if (i === 0) {

//                 renderer.setClearColor(0x000000, 0.0);
//                 renderer.clear();

//             }

//             this.fsQuad.render(renderer);

//         }

//         if (this.camera.setViewOffset && originalViewOffset.enabled) {

//             this.camera.setViewOffset(

//                 originalViewOffset.fullWidth, originalViewOffset.fullHeight,

//                 originalViewOffset.offsetX, originalViewOffset.offsetY,

//                 originalViewOffset.width, originalViewOffset.height

//             );

//         } else if (this.camera.clearViewOffset) {

//             this.camera.clearViewOffset();

//         }

//         renderer.autoClear = autoClear;
//         renderer.setClearColor(this._oldClearColor, oldClearAlpha);

//     }
// }

// var taaOverloadRender = function (taaPass) {
//     taaPass.render = function (renderer, writeBuffer, readBuffer, deltaTime) {

//         if (this.accumulate === false) {

//             super.render(renderer, writeBuffer, readBuffer, deltaTime);

//             this.accumulateIndex = - 1;
//             return;

//         }

//         const jitterOffsets = _JitterVectors[5];

//         if (this.sampleRenderTarget === undefined) {
//             // console.log("params",this.params);
//             this.sampleRenderTarget = new WebGLRenderTarget(readBuffer.width, readBuffer.height, { type: HalfFloatType });
//             this.sampleRenderTarget.texture.name = 'TAARenderPass.sample';

//         }

//         if (this.holdRenderTarget === undefined) {

//             this.holdRenderTarget = new WebGLRenderTarget(readBuffer.width, readBuffer.height, { type: HalfFloatType });
//             this.holdRenderTarget.texture.name = 'TAARenderPass.hold';

//         }

//         if (this.accumulateIndex === - 1) {

//             super.render(renderer, this.holdRenderTarget, readBuffer, deltaTime);

//             this.accumulateIndex = 0;

//         }

//         const autoClear = renderer.autoClear;
//         renderer.autoClear = false;

//         const sampleWeight = 1.0 / (jitterOffsets.length);

//         if (this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length) {

//             this.copyUniforms['opacity'].value = sampleWeight;
//             this.copyUniforms['tDiffuse'].value = writeBuffer.texture;

//             // render the scene multiple times, each slightly jitter offset from the last and accumulate the results.
//             const numSamplesPerFrame = Math.pow(2, this.sampleLevel);
//             for (let i = 0; i < numSamplesPerFrame; i++) {

//                 const j = this.accumulateIndex;
//                 const jitterOffset = jitterOffsets[j];

//                 if (this.camera.setViewOffset) {

//                     this.camera.setViewOffset(readBuffer.width, readBuffer.height,
//                         jitterOffset[0] * 0.0625, jitterOffset[1] * 0.0625, // 0.0625 = 1 / 16
//                         readBuffer.width, readBuffer.height);

//                 }

//                 renderer.setRenderTarget(writeBuffer);
//                 renderer.clear();
//                 renderer.render(this.scene, this.camera);

//                 renderer.setRenderTarget(this.sampleRenderTarget);
//                 if (this.accumulateIndex === 0) renderer.clear();
//                 this.fsQuad.render(renderer);

//                 this.accumulateIndex++;

//                 if (this.accumulateIndex >= jitterOffsets.length) break;

//             }

//             if (this.camera.clearViewOffset) this.camera.clearViewOffset();

//         }

//         const accumulationWeight = this.accumulateIndex * sampleWeight;

//         if (accumulationWeight > 0) {

//             this.copyUniforms['opacity'].value = 1.0;
//             this.copyUniforms['tDiffuse'].value = this.sampleRenderTarget.texture;
//             renderer.setRenderTarget(writeBuffer);
//             renderer.clear();
//             this.fsQuad.render(renderer);

//         }

//         if (accumulationWeight < 1.0) {

//             this.copyUniforms['opacity'].value = 1.0 - accumulationWeight;
//             this.copyUniforms['tDiffuse'].value = this.holdRenderTarget.texture;
//             renderer.setRenderTarget(writeBuffer);
//             if (accumulationWeight === 0) renderer.clear();
//             this.fsQuad.render(renderer);

//         }

//         renderer.autoClear = autoClear;

//     }
// }

// export { ssaaOverloadRender, taaOverloadRender };

