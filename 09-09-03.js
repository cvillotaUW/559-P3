/*jshint esversion: 6 */
// @ts-check

import * as T from "./libs/CS559-Three/build/three.module.js";
import { GrWorld } from "./libs/CS559-Framework/GrWorld.js";
import { GrObject } from "./libs/CS559-Framework/GrObject.js";
import * as InputHelpers from "./libs/CS559/inputHelpers.js";
import * as SimpleObjects from "./libs/CS559-Framework/SimpleObjects.js";
import { shaderMaterial } from "./libs/CS559-Framework/shaderHelper.js";


  let mydiv = document.getElementById("div1");
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
  const texture = new T.TextureLoader().load("./textures/Aerial_Campus18_9797.jpg");
  const dirtyMask = new T.TextureLoader().load("./textures/dirtmask.png");
  
  const dirtyMask2 = new T.TextureLoader().load("./textures/dirtmask.png");

  let world = new GrWorld({ width: mydiv ? 600 : 800, where: mydiv });

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


  
  let guy = new SimpleObjects.GrGuy({paintables: paintables, texMat: texMat, renderer: world.renderer});
  world.add(guy)

  world.go()

    


  let speed = 1;

  let canvas = world.renderer.domElement
  canvas.tabIndex = 1;
  canvas.onkeydown = function(event){
      if(!event.repeat){
          switch(event.code){
              case 'KeyW':
                  guy.input_forward += speed;
                  break;
              case 'KeyA':
                  guy.input_turn += speed;
                  break;
              case 'KeyS':
                  guy.input_forward -= speed;
                  break;
              case 'KeyD':
                  guy.input_turn -= speed;
                  break;
              case 'Space':
                  guy.input_up += speed
                  break;
              case 'ShiftLeft':
                  guy.input_up -= speed

          }
      }
      
  };

  canvas.onkeyup = function(event){
      switch(event.code){
          case 'KeyW':
              guy.input_forward -= speed;
              break;
          case 'KeyA':
              guy.input_turn -= speed;
              break;
          case 'KeyS':
              guy.input_forward += speed;
              break;
          case 'KeyD':
              guy.input_turn += speed;
              break;
          case 'Space':
              guy.input_up -= speed
              break;
          case 'ShiftLeft':
              guy.input_up += speed
      }
  };




// CS559 2025 Workbook
