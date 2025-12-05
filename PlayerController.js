
import * as T from "./libs/CS559-Three/build/three.module.js";

export class PlayerController{

    static height =1;
    /**
   * @param {T.Mesh} player
   */
  constructor(player, inputSource, looker, gun, colliders, jumpheight) {

    //initialize input vars
    this.input_forward = 0
    this.input_right = 0
    this.y_velocity = 0
    this.grounded = false

    let speed = 1;
    //set up input listening
    inputSource.onkeydown = (event) => {
      if(!event.repeat){
        
          switch(event.code){
              case 'KeyW':
                  this.input_forward += speed;
                  break;
              case 'KeyA':
                  this.input_right += speed;
                  break;
              case 'KeyS':
                  this.input_forward -= speed;
                  break;
              case 'KeyD':
                  this.input_right -= speed;
                  break;
              case 'Space':
                  if(this.grounded) this.y_velocity += speed*jumpheight
                  break;

          }
      }
    inputSource.onkeyup = (event) => {
        switch(event.code){
            case 'KeyW':
                this.input_forward -= speed;
                break;
            case 'KeyA':
                this.input_right -= speed;
                break;
            case 'KeyS':
                this.input_forward += speed;
                break;
            case 'KeyD':
                this.input_right += speed;
                break;
        }
  };
  };
    
    this.player = player;
    this.looker = looker
    this.raycaster = new T.Raycaster(new T.Vector3(), new T.Vector3(), 0, PlayerController.height);
    this.down = new T.Vector3(0, -1, 0)
    this.colliders = colliders
    this.gun = gun
    this.target = new T.Group
  }    
  
  /**
   * StepWorld method
   * @param {*} delta 
   */
  move(delta) {

    this.player.rotation.copy(this.looker.rotation)
    this.player.rotateY(Math.PI)

    this.target.position.copy(this.player.position)
    this.target.rotation.copy(this.player.rotation)
    this.target.translateZ(100)
    this.target.position.y = this.player.position.y
    this.player.lookAt(this.target.position)

    this.gun.rotation.copy(this.looker.rotation)
    this.gun.position.copy(this.player.position)
    this.gun.translateZ(-.55*.45)
    this.gun.translateX(.15*.45)
    this.gun.translateY(-.2*.45)
    this.gun.rotateX(Math.PI/8)
    this.gun.rotateY(Math.PI/3)


    //collsion
    let original = this.player.getWorldPosition(new T.Vector3())
    this.player.translateZ(this.input_forward * delta/250)
    this.player.translateY(this.y_velocity * delta /1000)
    this.player.translateX(this.input_right * delta / 250)
    let end = this.player.getWorldPosition(new T.Vector3())
    let direction = end.sub(original)
    let length = direction.length()
    this.raycaster.set(original, direction)
    this.raycaster.far = length + .5
    let colliders = this.raycaster.intersectObjects(this.colliders, true)
    if(colliders.length > 0){
        let hit = colliders[0]

        let moveTo = hit.point.clone().sub(direction.clone().normalize().multiplyScalar(0.5));

        // Compute sliding direction
        let normal = hit.face.normal.clone().applyMatrix3(new T.Matrix3().getNormalMatrix(colliders[0].object.matrixWorld)).normalize(); // normal of the surface hit
        direction.normalize()
        let slideDir = direction.clone().sub(normal.multiplyScalar(direction.dot(normal))).normalize().multiplyScalar(1-direction.dot(normal));

        // Move along the sliding plane instead of stopping
        moveTo.add(slideDir.multiplyScalar(length));

        this.player.position.copy(moveTo);

    }

    //gravitee
    this.raycaster.set(this.player.getWorldPosition(new T.Vector3()), this.down)
    this.raycaster.far = PlayerController.height
    let intersects = this.raycaster.intersectObjects(this.colliders, true)
    if(intersects.length > 0){
        this.y_velocity = 0
        this.grounded = true
        let snap = intersects[0].point.add(new T.Vector3(0, PlayerController.height, 0))
        this.player.position.set(snap.x, snap.y, snap.z)
    }
    else{
        this.grounded = false
        this.y_velocity = Math.max(this.y_velocity-delta/100, -10)
    }
  }
}
