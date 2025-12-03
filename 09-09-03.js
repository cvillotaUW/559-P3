/*jshint esversion: 6 */
// @ts-check

import * as T from "./libs/CS559-Three/build/three.module.js";
import { GrWorld } from "./libs/CS559-Framework/GrWorld.js";
import { GrObject } from "./libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "./libs/CS559/inputHelpers.js";
import * as SimpleObjects from "./libs/CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "./libs/CS559-Framework/shaderHelper.js";
import { Player } from "./Player.js";
import { PlayerController } from "./PlayerController.js";
import { Painter } from "./Painter.js";
import { PaintCube } from "./PaintCube.js";


  let mydiv = document.getElementById("div1");
  const game = document.createElement('div');
  mydiv.appendChild(game)
  let slider_u = new InputHelpers.LabelSlider("repetitions", {
    width: 400,
    min: 0,
    max: 6,
    step: 0.01,
    initial: 2,
    where: mydiv,
  });
  let slider_w = new InputHelpers.LabelSlider("wave height", {
    width: 400,
    min: 0,
    max: 2,
    step: 0.01,
    initial: 1,
    where: mydiv,
  });
  /**
   * @type {T.Mesh[]}
   */
  let paintables = []
  let isPainting = false
  const texture = new T.TextureLoader().load("./textures/Aerial_Campus18_9797.jpg");
  const dirtyMask = new T.TextureLoader().load("./textures/dirtmask.png");
  
  const dirtyMask2 = new T.TextureLoader().load("./textures/dirtmask.png");

  let world = new GrWorld({ width: 1920/5, height: 1080/5, where: game });

  let paintMat = shaderMaterial("./shaders/paint.vs", "./shaders/paint.fs", {
    uniforms: {tex: {value: texture}, point: {value: new T.Vector2(-10, -10)}}
  });

  let texMat = shaderMaterial("./shaders/texture.vs", "./shaders/dirtied.fs", {
    uniforms: {tex: {value: texture}, dirty: {value: dirtyMask}}
  });
  let dirtyMat = shaderMaterial("./shaders/texture.vs", "./shaders/dirtied.fs", {
        uniforms: {tex: {value: texture}, dirty: {value: dirtyMask}}
      });
  let bmat = new T.MeshStandardMaterial({map: texture})

  let segments = 50;
  let sphere =new SimpleObjects.GrSphere({ x: -3, y: 1.5, material: dirtyMat, widthSegments: segments, heightSegments: segments})
  world.add(sphere);
  paintables.push(sphere.mesh)

  let simpleSign = new SimpleObjects.dirtySign({ x: 3, y: 1, size: 1, texture: texture, dirtyMask: dirtyMask2, renderer: world.renderer})
  world.add(
    simpleSign
  ); 
  paintables.push(simpleSign.mesh)  
  let fancySign = new SimpleObjects.dirtySign({ x: .1, y: 1, size: 1, texture: texture, dirtyMask: dirtyMask, renderer: world.renderer})
  world.add(
    fancySign
  );
  paintables.push(fancySign.mesh)
  fancySign.mesh.geometry = new T.PlaneGeometry(2, 2, segments, segments);



  let canvas = world.renderer.domElement
  let guy = new Player()
  let painter = new Painter(paintables, world.renderer)
  let paintCube = new PaintCube("./textures/dirtmask.png", texture)
  world.scene.add(paintCube.mesh)
  paintCube.mesh.translateY(3)
  paintables.push(paintCube.mesh)

  
  let controller = new PlayerController(guy.mesh, canvas, world.active_camera, guy.gun, world.scene.children.slice());
  
  guy.mesh.translateY(1)
  guy.mesh.translateZ(3)

  world.active_camera.lookAt(fancySign.mesh.position)
  world.scene.add(guy.mesh)
  world.scene.add(guy.gun)
  world.scene.add(controller.target)
  fancySign.stepWorld = (delta) =>{
    world.active_camera.position.set(guy.mesh.position.x, guy.mesh.position.y, guy.mesh.position.z)
    controller.move(delta)
    if(isPainting) painter.paint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()), delta)
  }
  world.go({predraw: () => {

    
    
}})

  

  canvas.tabIndex = 1;
    
  canvas.addEventListener('click', () => {
      if(!world.active_controls?.isLocked){
          world.active_controls?.lock(true)
          if (game.requestFullscreen) {
            game.requestFullscreen();
          } else if (game.mozRequestFullScreen) { // Firefox
            game.mozRequestFullScreen();
          } else if (game.webkitRequestFullscreen) { // Chrome, Safari
            game.webkitRequestFullscreen();
          } else if (game.msRequestFullscreen) { // IE/Edge
            game.msRequestFullscreen();
          }
      }
      
  });

  canvas.addEventListener('mousedown', () => {
      isPainting = true
      
  });

  canvas.addEventListener('mouseup', () => {
      isPainting = false
      
  });

const crosshair = document.createElement('div');
crosshair.style.position = 'absolute';
crosshair.style.width = '30px';
crosshair.style.height = '30px';
crosshair.style.backgroundColor = 'transparent';
crosshair.style.border = '3px solid white';
crosshair.style.borderRadius = '50%';
crosshair.style.pointerEvents = 'none'; // Prevent crosshair from blocking interactions
crosshair.style.zIndex = '1000';
game.appendChild(crosshair)

function updateCrosshairPosition() {
  const rect = canvas.getBoundingClientRect(); // Get the canvas size and position
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  crosshair.style.width =  `${rect.width/100}px`;
  crosshair.style.height = `${rect.width/100}px`;
  crosshair.style.border = `${3}px solid white`;
  // Set the crosshair position to the center of the canvas
  crosshair.style.left = `${centerX - crosshair.offsetWidth / 2}px`;
  crosshair.style.top = `${centerY - crosshair.offsetHeight / 2}px`;
}
updateCrosshairPosition()
// Update crosshair position on window resize
window.addEventListener('resize', () => {
  
  if(document.fullscreenElement === game){
    world.renderer.setSize(window.innerWidth, window.innerWidth*1080/1920);
  }
  else{
    world.renderer.setSize(1920/5, 1080/5);
  }
  updateCrosshairPosition(); // Reposition crosshair on resize
});
// CS559 2025 Workbook
