
import * as T from "./libs/CS559-Three/build/three.module.js";
import { shaderMaterial } from "./libs/CS559-Framework/shaderHelper.js";
export class Painter{
    /**
   * @param {GuyProperties} params
   * @param {Array<string|Array>} [paramInfo] - parameters for the GrObject (for sliders)
   */
  constructor(paintables, renderer) {

    //create painting texture
    let texture = new T.TextureLoader().load("./textures/empty.png");
    let paintMat = shaderMaterial("./shaders/paint.vs", "./shaders/paint.fs", {
        uniforms: {tex: {value: texture}, point: {value: new T.Vector2(-10, -10)}}
    });

    
    //setup raycaster and targets
    this.paintables = paintables;
    this.raycaster = new T.Raycaster(new T.Vector3(), new T.Vector3(), 0, 10);

    //setup a simple scene for rendering
    const renderScene = new T.Scene();
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    this.renderer = renderer


    // Create a plane to hold the paint texture to be rendered
    const renderGeom = new T.PlaneGeometry(2, 2); // Full-screen plane
    const plane = new T.Mesh(renderGeom, paintMat);
    plane.position.set(0, 0, -1);  // Place it in front of the camera
    renderScene.add(plane);

    // Create a WebGLRenderTarget to render paint to
    this.renderTarget = new T.WebGLRenderTarget(512, 512,  {
        minFilter: T.LinearMipmapLinearFilter, 
        magFilter: T.LinearFilter,             
        generateMipmaps: true                      
    });

    this.renderScene = renderScene
    this.camera = camera
    this.plane = plane
    this.mat = paintMat
    this.lastPaint = 0
  }    
  
  /**
   * StepWorld method
   * @param {*} delta 
   * @param {*} timeOfDay 
   */
  paint(position, direction, delta) {
    
    this.lastPaint += delta
    if(this.lastPaint > 20){
        this.lastPaint = 0
        this.raycaster.set(position, direction)

        let intersects = this.raycaster.intersectObjects(this.paintables, true)
        
            // If the ray hits an object, log the intersection
        if (intersects.length > 0 && intersects[0].object.material.uniforms.tex.value.image && this.mat.uniforms.tex.value.image) {
            if(intersects[0].object.material.uniforms.isClean.value){   
                return {name: intersects[0].object.name, dirtiness: 0}
            }
            let oldSize = new T.Vector2()
            this.renderer.getSize(oldSize)
            this.mat.uniforms.point.value = intersects[0].uv
            this.renderer.copyTextureToTexture(intersects[0].object.material.uniforms.dirty.value, this.mat.uniforms.tex.value)

            this.renderer.setSize(512, 512)
            this.renderer.setRenderTarget(this.renderTarget)
            this.renderer.render(this.renderScene, this.camera)

            //how much left?
            const pixels = new Uint8Array(512 * 512 * 4);  // *4 because RGBA, 4 per pixel
            this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, 512, 512, pixels);

            let totalRed = 0;

            // Red is dirty mask, all we need
            for (let i = 0; i < pixels.length; i += 4) {
                const red = pixels[i];
                totalRed += red;
            }

            const possibleRed = (pixels.length / 4) * 255
            const redness = totalRed / possibleRed * 100;  // As a percentage


            this.renderer.setRenderTarget(null)
            if(redness < 5){
                intersects[0].object.material.uniforms.isClean.value = true
            }    
            
            this.renderer.copyTextureToTexture(this.renderTarget.texture, intersects[0].object.material.uniforms.dirty.value)
            this.renderer.setSize(oldSize.x, oldSize.y)
            
            return {name: intersects[0].object.name, dirtiness: redness}
        }
        return null
    }
  }
    
}
