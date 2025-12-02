
import * as T from "./libs/CS559-Three/build/three.module.js";

export class PlayerController{
    /**
   * @param {T.Mesh} player
   */
  constructor(player, inputSource, looker) {

    //initialize input vars
    this.input_forward = 0
    this.input_up = 0
    this.input_right = 0


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
                  this.input_up += speed
                  break;
              case 'ShiftLeft':
                  this.input_up -= speed
          }
      }
    inputSource.onkeyup = (event) => {
        switch(event.code){
            case 'KeyW':
                this.input_forward = 0;
                break;
            case 'KeyA':
                this.input_right = 0;
                break;
            case 'KeyS':
                this.input_forward = 0;
                break;
            case 'KeyD':
                this.input_right = 0;
                break;
            case 'Space':
                this.input_up = 0
                break;
            case 'ShiftLeft':
                this.input_up = 0
        }
  };
  };
    this.player = player;
    this.looker = looker
  }    
  
  /**
   * StepWorld method
   * @param {*} delta 
   */
  move(delta) {
    this.player.rotation.copy(this.looker.rotation)
    this.player.rotateY(Math.PI)
    this.player.translateZ(this.input_forward * delta/250)
    this.player.translateY(this.input_up * delta /1000)
    this.player.translateX(this.input_right * delta / 250)
  }
}
