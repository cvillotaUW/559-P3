
import * as T from "./libs/CS559-Three/build/three.module.js";
import { shaderMaterial } from "./libs/CS559-Framework/shaderHelper.js";
export class Painter{
    /**
   * @param {GuyProperties} params
   * @param {Array<string|Array>} [paramInfo] - parameters for the GrObject (for sliders)
   */
  constructor(paintables, renderer) {


    //setup raycaster and targets
    this.paintables = paintables;
    this.raycaster = new T.Raycaster(new T.Vector3(), new T.Vector3(), 0, 10);

    //setup a simple scene for rendering
    const renderScene = new T.Scene();
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    this.renderer = renderer


    let renderPlanes = {}
    // Create a plane to hold the paint texture to be rendered
    paintables.forEach((paintable) => {
      console.log(paintable)
      let paintMat = shaderMaterial("./shaders/paint.vs", "./shaders/paint.fs", {
          uniforms: {tex: {value: paintable.material.uniforms.dirty.value}, point: {value: new T.Vector2(-10, -10)}, point2: {value: new T.Vector2(-10, -10)}, point3: {value: new T.Vector2(-10, -10)}, point4: {value: new T.Vector2(-10, -10)}, point5: {value: new T.Vector2(-10, -10)}, size: {value: 0.1}}
      });
      const renderGeom = new T.PlaneGeometry(2, 2); // Full-screen plane
      const plane = new T.Mesh(renderGeom, paintMat);
      plane.position.set(0, 0, -1);  // Place it in front of the camera
      renderScene.add(plane);
      plane.visible = false;
      renderPlanes[paintable.name] = plane
    });


    // Create a WebGLRenderTarget to render paint to
    this.renderTarget = new T.WebGLRenderTarget(512, 512,  {
        minFilter: T.LinearMipmapLinearFilter, 
        magFilter: T.LinearFilter,             
        generateMipmaps: true                      
    });

    this.renderScene = renderScene
    this.camera = camera
    this.renderPlanes = renderPlanes
    this.lastPaint = 0
        
    
    const geometry = new T.PlaneGeometry(4, 4);
    let debugMat = shaderMaterial("./shaders/texture.vs", "./shaders/texture.fs", {
        uniforms: {tex: {value: this.renderTarget.texture}}
      });
    this.debugPlane =  new T.Mesh(geometry, debugMat)
    this.debugPlane.translateY(6)
    this.points = []
    this.target = null
    this.empty = new T.Vector2(-10, -10)
    this.power = 1
    this.godmode = 1;
  }    
  
  /**
   * StepWorld method
   * @param {*} delta 
   * @param {*} timeOfDay 
   */
  paint() {

    if (this.points.length > 0 && this.target.material.uniforms.tex.value.image) {
        if(this.target.material.uniforms.isClean.value){   
            return {name: this.target.name, dirtiness: 100}
        }
        let plane = this.renderPlanes[this.target.name]
        let mat = plane.material
        if(this.target.size){
            
            mat.uniforms.size.value = this.target.size * this.power * this.godmode
        }
        else{
            mat.uniforms.size.value = .2 * this.power * this.godmode
        }
        let oldSize = new T.Vector2()
        this.renderer.getSize(oldSize)
        mat.uniforms.point.value = this.points[0]
        if(this.points.length > 1) mat.uniforms.point2.value = this.points[1]
        else mat.uniforms.point2.value = this.empty
        if(this.points.length > 2) mat.uniforms.point3.value = this.points[2]
        else mat.uniforms.point3.value = this.empty
        if(this.points.length > 3) mat.uniforms.point4.value = this.points[3]
        else mat.uniforms.point4.value = this.empty
        if(this.points.length > 4) mat.uniforms.point5.value = this.points[4]
        else mat.uniforms.point5.value = this.empty
        

        plane.visible = true
        this.renderer.setSize(512, 512)
        this.renderer.setRenderTarget(this.renderTarget)
        this.renderer.render(this.renderScene, this.camera)
        plane.visible = false

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

        //based on start/end
        let end = this.target.end ? this.target.end : 5
        let start = this.target.start ? this.target.start : 57

        this.renderer.setRenderTarget(null)
        if(redness < end){
            this.target.material.uniforms.isClean.value = true
        }    
        
        this.renderer.copyTextureToTexture(this.renderTarget.texture, this.target.material.uniforms.dirty.value)
        this.renderer.setSize(oldSize.x, oldSize.y)
        let percentClean = (redness-start)/(end-start)*100
        return {name: this.target.name, dirtiness: percentClean}
    }
    return null
  }
  getPaintPoint(position, direction){
    this.raycaster.set(position, direction)
    let intersects = this.raycaster.intersectObjects(this.paintables, true)
    if (intersects.length > 0 && (this.target == null || intersects[0].object == this.target)) {
        this.points.push(intersects[0].uv)
        this.target = intersects[0].object  
    }
    return null
  }

  clearPoints(){
    this.points = []
    this.target = null
  }
    
}
