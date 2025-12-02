
import * as T from "./libs/CS559-Three/build/three.module.js";
export class Player{
    /**
   * @param {GuyProperties} params
   * @param {Array<string|Array>} [paramInfo] - parameters for the GrObject (for sliders)
   */
  constructor(params = {}, paramInfo = []) {

    //make the player body
    const material = params.material ?? new T.MeshStandardMaterial({ color: params.color ?? '#FF8888' });
    const size = params.size ?? 1;
    const geometry = new T.BoxGeometry(
      size, 
      size, 
      size,
      params.widthSegments ?? 1,
      params.heightSegments ?? 1
    );
    const mesh = new T.Mesh(geometry, material);
    const head = new T.Mesh(geometry, material);
    mesh.add(head);
    head.translateZ(.5)
    head.translateY(.5)
    head.scale.set(.5, .5, .5)
    this.mesh = mesh;
  }    
  

}
