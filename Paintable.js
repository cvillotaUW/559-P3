import * as T from "./libs/CS559-Three/build/three.module.js";
import { shaderMaterial } from "./libs/CS559-Framework/shaderHelper.js";
export class Paintable {
    /**
     */
    constructor(dirtyMaskPath, texture) {
        let dirtyMask = new T.TextureLoader().load(dirtyMaskPath);
        this.dirtyMat = shaderMaterial("./shaders/texture.vs", "./shaders/dirtied.fs", {
              uniforms: {tex: {value: texture}, dirty: {value: dirtyMask}, isClean: {value: false}}
        });
      
    }
  }
  