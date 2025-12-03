import * as T from "./libs/CS559-Three/build/three.module.js";
import { Paintable } from "./Paintable.js";
export class PaintCube extends Paintable{
    /**
   * @param {GuyProperties} params
   * @param {Array<string|Array>} [paramInfo] - parameters for the GrObject (for sliders)
   */
  constructor(dirtyMaskPath, texture) {

    let geom = new T.BufferGeometry()
    
    let box_vertices = new Float32Array( [
	-.75, 0.0,  -.75, //tiangle face 
    -.75,  0,  .75, 
    -.75, 1.5,  -.75,
    -.75, 1.5,  -.75, //tiangle  
    -.75,  0,  .75,
    -.75,  1.5,  .75,

    .75, 0.0,  -.75, //tiangle face 
    -.75,  0,  -.75, 
    .75, 1.5,  -.75,
    .75, 1.5,  -.75, //tiangle  
    -.75,  0,  -.75,
    -.75,  1.5,  -.75,

    .75, 0.0,  .75, //tiangle face 
    .75,  0,  -.75, 
    .75, 1.5,  .75,
    .75, 1.5,  .75, //tiangle  
    .75,  0,  -.75,
    .75,  1.5,  -.75,

    -.75, 0.0,  .75, //tiangle face 
    .75,  0,  .75, 
    -.75, 1.5,  .75,
    -.75, 1.5,  .75, //tiangle  
    .75,  0,  .75,
    .75,  1.5,  .75,

    
    -.75, 0.0,  .75, //tiangle face 
    .75,  0,  -.75, 
    .75, 0,  .75,
    -.75, 0,  .75, //tiangle  
    -.75,  0,  -.75,
    .75,  0,  -.75,

    -.75, 1.5,  .75, //tiangle face 
    .75, 1.5,  .75,
    .75,  1.5,  -.75, 
    -.75, 1.5,  .75, //tiangle  
    .75,  1.5,  -.75,
    -.75,  1.5,  -.75,
    ] );

    //each face is left, right, upleft, upleft, right, upright
    const box_uvs = new Float32Array( [
        0,0, //tiangle face
        .333,0,
        0,.5,        
        0,.5,
        .333,0, //tiangle
        .333,0.5, 
        
        .333,0, //tiangle face
        .666,0,
        .333,.5,        
        .333,.5,
        .666,0, //tiangle
        .666,0.5, 
        
        
        
        .666,0, //tiangle face
        1,0,
        .666,.5,        
        .666,.5,
        1,0, //tiangle
        1,0.5, 
        
        0,.5, //tiangle face
        .333,.5,
        0,1,        
        0,1,
        .333,.5, //tiangle
        .333,1, 

        //botom
        0.333,1,
        .666,.5, //tiangle
        .666,1, 
        0.333,1,    
        .333,.5, //tiangle face
        .666,.5,    

        
        //top
        0.666,1,
        1,1, 
        1,.5, //tiangle
        0.666,1,    
        1,.5,  
        .666,.5, //tiangle face
        
        
        
        
    ]);
    
    super(dirtyMaskPath, texture)
    geom.setAttribute('uv',new T.BufferAttribute(box_uvs,2));

    geom.setAttribute('position', new T.BufferAttribute( box_vertices, 3 ) );
    geom.computeVertexNormals();

    let mesh = new T.Mesh(geom, this.dirtyMat);
    
    this.mesh = mesh
  }    
  

}
