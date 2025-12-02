
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
    this.oldSize = new T.Vector2()
    renderer.getSize(this.oldSize)

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
  }    
  
  /**
   * StepWorld method
   * @param {*} delta 
   * @param {*} timeOfDay 
   */
  paint(position, direction) {
    

    this.raycaster.set(position, direction)

    let intersects = this.raycaster.intersectObjects(this.paintables, true)
    
        // If the ray hits an object, log the intersection
    if (intersects.length > 0 && intersects[0].object.material.uniforms.tex.value.image && this.mat.uniforms.tex.value.image) {

        this.mat.uniforms.point.value = intersects[0].uv
        this.renderer.copyTextureToTexture(intersects[0].object.material.uniforms.dirty.value, this.mat.uniforms.tex.value)

        this.renderer.setSize(512, 512)
        this.renderer.setRenderTarget(this.renderTarget)
        this.renderer.render(this.renderScene, this.camera)
        this.renderer.setRenderTarget(null)
        
        this.renderer.copyTextureToTexture(this.renderTarget.texture, intersects[0].object.material.uniforms.dirty.value)
        this.renderer.setSize(this.oldSize.x, this.oldSize.y)
    }
  }
}
