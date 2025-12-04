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
import { OBJLoader } from "./libs/CS559-Three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "./libs/CS559-Three/examples/jsm/loaders/MTLLoader.js";
import { GLTFLoader } from "./libs/CS559-Three/examples/jsm/loaders/GLTFLoader.js";
  //ui stuff
  let mydiv = document.getElementById("div1");
  const game = document.createElement('div');

  let world = new GrWorld({ width: 1920/5, height: 1080/5, where: game });
  let canvas = world.renderer.domElement

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


  // Create the container for the name and progress bar
  const infoBox = document.createElement('div');
  infoBox.style.position = 'absolute';
  infoBox.style.top = '20px'; // 20px from the top of the screen
  infoBox.style.left = '20px'; // 20px from the left of the screen
  infoBox.style.width = '200px'; // Set width of the box
  infoBox.style.padding = '10px';
  infoBox.style.backgroundColor = 'rgba(89, 120, 255, 1)';
  infoBox.style.borderRadius = '8px';
  infoBox.style.border = '3px solid black'
  infoBox.style.color = 'white';
  infoBox.style.fontFamily = 'Arial, sans-serif';
  infoBox.style.fontSize = '14px';
  infoBox.style.zIndex = '1000'; // Make sure it appears on top
  infoBox.style.pointerEvents = 'none'; // Prevent blocking interactions
  game.appendChild(infoBox);

  // Create the name text element
  const nameText = document.createElement('div');
  nameText.style.fontSize = '16px';
  nameText.style.fontWeight = 'bold';
  nameText.textContent = 'Player Name'; // Replace with the name you want to display
  infoBox.appendChild(nameText);
  // Create the progress bar container
  const progressBarContainer = document.createElement('div');
  progressBarContainer.style.width = '100%';
  progressBarContainer.style.height = '5px';
  progressBarContainer.style.backgroundColor = '#555';
  progressBarContainer.style.borderRadius = '5px';
  progressBarContainer.style.marginTop = '10px'; // Add some space between the name and progress bar
  infoBox.appendChild(progressBarContainer);

  // Create the progress bar itself
  const progressBar = document.createElement('div');
  progressBar.style.height = '100%';
  progressBar.style.backgroundColor = '#4caf50'; // Green color for progress
  progressBar.style.borderRadius = '5px';
  progressBar.style.width = '0%'; // Start with 0% width, this will be updated dynamically
  progressBarContainer.appendChild(progressBar);
  
  const percentageText = document.createElement('div');
  percentageText.style.fontSize = '16px';
  percentageText.style.fontWeight = 'bold';
  percentageText.style.marginTop = '5px'; // Add some space between the progress bar and percentage number
  percentageText.textContent = "yuh"
  infoBox.appendChild(percentageText);

  // Function to update the progress bar percentage
  function updateProgressBar(percentage, name) {
    // Ensure the percentage stays within 0-100
    progressBar.style.width = `${percentage}%`; // Set the width of the progress bar
    nameText.textContent = name; // Replace with the name you want to display
    percentageText.textContent = `${percentage}%`; // Replace with the name you want to display
  }

  function updateBoxPosition(){
      const rect = canvas.getBoundingClientRect(); // Get the canvas size and position
      infoBox.style.top = `${rect.height/50+8}px`; // 20px from the top of the screen
      infoBox.style.left = `${rect.width/50+8}px`; // 20px from the left of the screen
      infoBox.style.width = `${rect.width/4}px`; // Set width of the box
      infoBox.style.height = `${rect.height/6}px`;  
      infoBox.style.border = `${rect.width/150}px solid black`

      nameText.style.fontSize = `${rect.width*0.03}px`; // Font size based on window width
      percentageText.style.fontSize = `${rect.width*0.02}px`; // Font size based on window width
  }
  updateBoxPosition()

  //skybox
  const loader = new T.CubeTextureLoader();
  const skyboxTexture = loader.load([
      'textures/px.png', 
      'textures/nx.png', 
      'textures/py.png', 
      'textures/ny.png', 
      'textures/pz.png', 
      'textures/nz.png', 
  ]);
  world.scene.background = skyboxTexture

  /**
   * @type {T.Mesh[]}
   */
  let paintables = []
  let isPainting = false
  const texture = new T.TextureLoader().load("./textures/Aerial_Campus18_9797.jpg");
  const dirtyMask = new T.TextureLoader().load("./textures/dirtmask.png");
  
  const dirtyMask2 = new T.TextureLoader().load("./textures/dirtmask.png");

  


  let paintMat = shaderMaterial("./shaders/paint.vs", "./shaders/paint.fs", {
    uniforms: {tex: {value: texture}, point: {value: new T.Vector2(-10, -10)}}
  });

  let texMat = shaderMaterial("./shaders/texture.vs", "./shaders/dirtied.fs", {
    uniforms: {tex: {value: texture}, dirty: {value: dirtyMask}, isClean: {value: false}}
  });
  let dirtyMat = shaderMaterial("./shaders/texture.vs", "./shaders/dirtied.fs", {
        uniforms: {tex: {value: texture}, dirty: {value: dirtyMask}, isClean: {value: false}}
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


  
  
  
  const gltf = new GLTFLoader();

// Load a glTF or GLB file
let model = await gltf.loadAsync('./models/car.glb')
  world.scene.add(model.scene);
  console.log(model)
 model.scene.traverse((child) => {
    if (child.isMesh) {
      // Now you have access to the materials and textures of each mesh
      console.log('Material of this mesh:', child.material);
      child.name = "Car"
      child.size = 0.01
      child.start = 21.8
      child.end = 20.5

      let dirtyMask = new T.TextureLoader().load("./textures/carDirt.png");
      let dirtyMat = shaderMaterial("./shaders/texture.vs", "./shaders/dirtied.fs", {
            uniforms: {tex: {value: child.material.map}, dirty: {value: dirtyMask}, isClean: {value: false}}
      });
      child.material = dirtyMat
      // If you want to get the textures applied to this material:
      const material = child.material;
      if (material.map) {
        console.log('Diffuse texture:', material.map); // This is the base color texture
      }
      if (material.normalMap) {
        console.log('Normal map:', material.normalMap);
      }
      if (material.metalnessMap) {
        console.log('Metalness map:', material.metalnessMap);
      }
      if (material.roughnessMap) {
        console.log('Roughness map:', material.roughnessMap);
      }
    }
  })
  model.scene.scale.set(.035, .035, .035)
  model.scene.position.set(0, 0, 3)
  model.scene.rotateY(Math.PI/2)
  console.log("moving on")
  let guy = new Player()
  let painter = new Painter(paintables, world.renderer)
  world.scene.add(painter.debugPlane)
  let paintCube = new PaintCube("./textures/dirtmask.png", texture)
  world.scene.add(paintCube.mesh)
  paintCube.mesh.translateY(3)
  paintables.push(paintCube.mesh)
  paintCube.mesh.name = "paintcube"
  paintables.push(model.scene)
  
  let controller = new PlayerController(guy.mesh, canvas, world.active_camera, guy.gun, world.scene.children.slice());
  
  guy.mesh.translateY(20)
  guy.mesh.translateZ(3)

  world.active_camera.lookAt(fancySign.mesh.position)
  world.scene.add(guy.mesh)
  world.scene.add(guy.gun)
  world.scene.add(controller.target)
  fancySign.stepWorld = (delta) =>{
    world.active_camera.position.set(guy.mesh.position.x, guy.mesh.position.y, guy.mesh.position.z)
    controller.move(delta)
    if(isPainting){
      let result = painter.paint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()), delta)
      if(result) updateProgressBar(result.dirtiness, result.name)
    }
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






// Update crosshair position on window resize
window.addEventListener('resize', () => {
  
  if(document.fullscreenElement === game){
    world.renderer.setSize(window.innerWidth, window.innerWidth*1080/1920);
  }
  else{
    world.renderer.setSize(1920/5, 1080/5);
  }
  updateCrosshairPosition(); // Reposition crosshair on resize
  updateBoxPosition();
});
// CS559 2025 Workbook
