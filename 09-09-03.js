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

  let world = new GrWorld({ width: 1920/2, height: 1080/2, where: game });
  let canvas = world.renderer.domElement

  mydiv.appendChild(game)
  
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
  nameText.textContent = 'Start cleaning!'; // Replace with the name you want to display
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
  percentageText.textContent = ""
  infoBox.appendChild(percentageText);

  // Function to update the progress bar percentage
  function updateProgressBar(percentage, name) {
    // Ensure the percentage stays within 0-100
    progressBar.style.width = `${percentage}%`; // Set the width of the progress bar
    nameText.textContent = name; // Replace with the name you want to display
    percentageText.textContent = percentage< 100? `${Math.round(percentage*10)/10}%` : "Clean!"; // Replace with the name you want to display
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
  let zoom = false;
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
let model = await gltf.loadAsync('./models/Car.glb')
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

  let paintCube = new PaintCube("./textures/dirtmask.png", texture)
  world.scene.add(paintCube.mesh)
  paintCube.mesh.translateY(3)
  paintables.push(paintCube.mesh)
  paintCube.mesh.name = "paintcube"
  paintables.push(model.scene)

  let gun = await gltf.loadAsync('./models/watergun.glb')

  let guy = new Player()
  guy.gun = gun.scene

  let controller = new PlayerController(guy.mesh, canvas, world.active_camera, guy.gun, world.scene.children.slice());

  guy.gun.scale.set(0.4, 0.4, 0.4)
  let painter = new Painter(paintables, world.renderer)
  world.scene.add(painter.debugPlane)

  
  
  guy.mesh.translateY(2)
  guy.mesh.translateZ(3)

  world.active_camera.lookAt(fancySign.mesh.position)
  world.scene.add(guy.mesh)
  world.scene.add(guy.gun)
  world.scene.add(controller.target)



  //particles
  const particleCount = 1000;  // Number of particles in the pool
const particlesGroup = new T.Group();  // Group to hold all particles
const pool = [];  // To keep track of all particles



// Create the particles in a pool but don't animate them yet
for (let i = 0; i < particleCount; i++) {
    const material = new T.PointsMaterial({
        color: 0x00aaff,
        size: 0.05,
        transparent: true,
        opacity: 1,
    });  
    const sphere = new T.Mesh(new T.SphereGeometry(0.025), material);
    sphere.visible = false;  // Initially invisible, will be activated when needed
    particlesGroup.add(sphere);
    pool.push({
        sphere: sphere,
        velocity: new T.Vector3(0, 0, 0),  // Particle velocity
        isActive: false,  // Track if the particle is active,
        lifetime: 100
    });
}

world.scene.add(particlesGroup);


let nozzlePoint = new T.Group()
guy.gun.add(nozzlePoint)

nozzlePoint.rotateY(Math.PI/1.3)
nozzlePoint.rotateX(Math.PI/2)
nozzlePoint.translateY(.3)

nozzlePoint.rotateX(3*Math.PI/2)

nozzlePoint.rotateY(-Math.PI/17)

nozzlePoint.rotateX(Math.PI/16)


function resetParticle(particle) {
    const random1 = Math.random() * 0.2 - 0.1;  
    const random2 = Math.random() * 0.2 - 0.1;  

    let resetPoint = nozzlePoint.getWorldPosition(new T.Vector3())
    let mainDirection = nozzlePoint.getWorldDirection(new T.Vector3)
    let target = mainDirection.add(resetPoint)
    console.log(target)

    particle.sphere.position.set(resetPoint.x, resetPoint.y, resetPoint.z);
    particle.sphere.lookAt(target)
    particle.sphere.visible = true;  // Make it visible
    particle.velocity.set(
        random1, // X velocity
        random2,            // Y velocity (mostly upward)
        1  // Z velocity
    );
    particle.lifetime = 100
    particle.isActive = true;  // Mark as active
}

let lastTime = 0;
let time = 0;
  fancySign.stepWorld = (delta) =>{
    if(zoom){
      console.log("woah")

      world.active_camera.fov = T.MathUtils.lerp(world.active_camera.fov, 45, .2)
      world.active_camera.updateProjectionMatrix();
    }
    else{
      world.active_camera.fov = T.MathUtils.lerp(world.active_camera.fov, 90, .2)
      world.active_camera.updateProjectionMatrix();
    }
    time+=delta
    world.active_camera.position.set(guy.mesh.position.x, guy.mesh.position.y, guy.mesh.position.z)
    controller.move(delta)
    if(isPainting){
      let result = painter.paint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()), delta)
      if(result) updateProgressBar(result.dirtiness, result.name)
    }

    //update particles
    if (time - lastTime > 50 && isPainting) {  // Emit every 50ms (can be adjusted)
            lastTime = time;

            // Find an inactive particle and reset it
            for (let i = 0; i < pool.length; i++) {
                const particle = pool[i];
                if (!particle.isActive) {
                    resetParticle(particle);
                    break; // Only emit one particle at a time for simplicity
                }
            }
            for (let i = 0; i < pool.length; i++) {
                const particle = pool[i];
                if (!particle.isActive) {
                    resetParticle(particle);
                    break; // Only emit one particle at a time for simplicity
                }
            }
        }

        // Update the position of active particles and handle them
        for (let i = 0; i < pool.length; i++) {
            const particle = pool[i];
            if (particle.isActive) {
                // Update position based on velocity
                //particle.velocity.y -= 0.001;
                particle.sphere.translateZ(particle.velocity.z * delta /100)
                particle.sphere.translateY(particle.velocity.y * delta /100)
                particle.sphere.translateX(particle.velocity.x * delta /100)

                if (particle.lifetime < 0) {
                    particle.sphere.visible = false;  // Hide the particle
                    particle.isActive = false;  // Mark as inactive
                }
                particle.sphere.material.opacity = particle.lifetime/100
                particle.lifetime-=delta/5
            }
        }
  }
  world.go()

  

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

  canvas.addEventListener('mousedown', (e) => {
      if(e.button == 0) isPainting = true
      else if(e.button == 2){
        zoom = true;
      }
  });

  canvas.addEventListener('mouseup', (e) => {
      if(e.button == 0) isPainting = false
      else if(e.button == 2){
        zoom = false;
      }
      
  });





// Update crosshair position on window resize
window.addEventListener('resize', () => {
  
  if(document.fullscreenElement === game){
    world.renderer.setSize(window.innerWidth, window.innerWidth*1080/1920);
  }
  else{
    world.renderer.setSize(1920/2, 1080/2);
  }
  updateCrosshairPosition(); // Reposition crosshair on resize
  updateBoxPosition();
});
// CS559 2025 Workbook
