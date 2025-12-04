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
async function go(graphicsGood, paintWait){
    //ui stuff
    const game = document.getElementById("div1");

    const vic = document.getElementById('victoryScreen')
    let world = new GrWorld({ width: 1920/2, height: 1080/2, where: game, groundplanesize: 15});
    let canvas = world.renderer.domElement
    let nozzleType = 0
    
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

    // Create two divs for the horizontal and vertical lines of the plus
    const horizontalLine = document.createElement('div');
    const verticalLine = document.createElement('div');

    // Style for horizontal line (width and position it in the middle)
    horizontalLine.style.position = 'absolute';
    horizontalLine.style.width = '100%';
    horizontalLine.style.height = '4px';  // Adjust thickness of the line
    horizontalLine.style.backgroundColor = 'white';

    // Style for vertical line (height and position it in the middle)
    verticalLine.style.position = 'absolute';
    verticalLine.style.width = '4px';    // Adjust thickness of the line
    verticalLine.style.height = '100%';
    verticalLine.style.backgroundColor = 'white';

    // Append the lines to the crosshair container
    crosshair.appendChild(horizontalLine);
    crosshair.appendChild(verticalLine);

    function updateCrosshairPosition() {
      const rect = canvas.getBoundingClientRect(); // Get the canvas size and position
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const size = rect.width / 100;  // Crosshair size relative to canvas width

      crosshair.style.width =  `${size}px`;
      crosshair.style.height = `${size}px`;
      crosshair.style.border = nozzleType == 0 ? `${3}px solid white`: `${0}px solid white`;
      // Set the crosshair position to the center of the canvas
      crosshair.style.left = `${centerX - crosshair.offsetWidth / 2}px`;
      crosshair.style.top = `${centerY - crosshair.offsetHeight / 2}px`;
      // Adjust the thickness of the lines relative to the canvas size
      
      horizontalLine.style.height = nozzleType == 1 ?`${0}px`:`${2}px`;
      verticalLine.style.width = nozzleType == 2 ?`${0}px`:`${2}px`;
      // Adjust the position of the lines to center them in the crosshair container
      horizontalLine.style.top = `${(size) / 2-1}px`;
      verticalLine.style.left = `${(size) / 2-1}px`;
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

    let cleans = {"Car": false, "Driveway": false, "House": false}
    // Function to update the progress bar percentage
    function updateProgressBar(percentage, name) {
      // Ensure the percentage stays within 0-100
      progressBar.style.width = `${percentage}%`; // Set the width of the progress bar
      nameText.textContent = name; // Replace with the name you want to display
      if (percentage >= 100){
        cleans[name] = true
      }
      if(cleans["Car"] && cleans["Driveway"] && cleans["House"]) vic.style.display = 'block'
      percentageText.textContent = percentage< 100? `${Math.floor(percentage*10)/10}%` : "Clean!"; // Replace with the name you want to display
    }

    function updateBoxPosition(){
        const rect = canvas.getBoundingClientRect(); // Get the canvas size and position
        infoBox.style.top = `${rect.top+rect.height/50+8}px`; // 20px from the top of the screen
        infoBox.style.left = `${rect.left+rect.width/50+8}px`; // 20px from the left of the screen
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

    let fancySign = new SimpleObjects.dirtySign({ x: .1, y: 1, size: 1, texture: texture, dirtyMask: dirtyMask, renderer: world.renderer})
    world.add(
      fancySign
    );
    fancySign.mesh.visible = false

    
    
    
    const gltf = new GLTFLoader();

  // Load a glTF or GLB file
  if(graphicsGood){
      let model = await gltf.loadAsync('./models/Car.glb')
      world.scene.add(model.scene);
    model.scene.traverse((child) => {
        if (child.isMesh) {
          // Now you have access to the materials and textures of each mesh
          child.name = "Car"
          child.size = 0.01
          child.start = 21.8
          child.end = 20.5

          let dirtyMask = new T.TextureLoader().load("./textures/carDirt.png");
          let dirtyMat = shaderMaterial("./shaders/texture.vs", "./shaders/dirtied.fs", {
                uniforms: {tex: {value: child.material.map}, dirty: {value: dirtyMask}, isClean: {value: false}}
          });
          child.material = dirtyMat

        }
      })
      model.scene.scale.set(.035, .035, .035)
      model.scene.position.set(-3, 0, 5)
      model.scene.rotateY(Math.PI)
      paintables.push(model.scene)
       let house = await gltf.loadAsync('./models/Farm house.glb')
  world.scene.add(house.scene);
  house.scene.traverse((child) => {
      if (child.isMesh) {
        // Now you have access to the materials and textures of each mesh
        child.name = "House"
        child.size = 0.02
        child.start = 56.25
        child.end = 10

        let dirtyMask = new T.TextureLoader().load("./textures/dirtmask.png");
        let dirtyMat = shaderMaterial("./shaders/texture.vs", "./shaders/dirtied.fs", {
              uniforms: {tex: {value: child.material.map}, dirty: {value: dirtyMask}, isClean: {value: false}}
        });
        child.material = dirtyMat

      }
    })
    house.scene.scale.set(.5, .5, .5)
    house.scene.position.set(0, 0, -3)
    paintables.push(house.scene)    
  }
  else{
    let tex = new T.TextureLoader().load("./textures/carBox.png");
    let car = new PaintCube("./textures/dirtmask.png", tex)
    car.mesh.position.set(-3, 0, 5)
    car.mesh.scale.set(1.25, 1.25, 1.25)
    car.mesh.size = .08
    car.mesh.start = 56.25
    car.mesh.end = 10.25
    car.mesh.name = "Car"
    world.scene.add(car.mesh)
    paintables.push(car.mesh)

    let houseTex = new T.TextureLoader().load("./textures/houseBox.png");
    let house = new PaintCube("./textures/dirtmask.png", tex)
    house.mesh.position.set(-1.5, 0, -5.5)
    house.mesh.scale.set(6, 6, 6)
    house.mesh.size = .03
    house.mesh.start = 56.25
    house.mesh.end = 10.25
    house.mesh.name = "House"
    world.scene.add(house.mesh)
    paintables.push(house.mesh)
  }

 
    
    const geometry = new T.PlaneGeometry(8, 8);
      let drivewayMask = new T.TextureLoader().load("./textures/dirtmask.png");
      let drivewayTex = new T.TextureLoader().load("./textures/driveWay.png");
      let drivewayMat = shaderMaterial("./shaders/texture.vs", "./shaders/dirtied.fs", {
            uniforms: {tex: {value: drivewayTex}, dirty: {value: drivewayMask}, isClean: {value: false}}, side: T.DoubleSide
      });
      let driveWay =  new T.Mesh(geometry, drivewayMat)
      world.scene.add(driveWay)

      driveWay.translateY(0.01)
      driveWay.rotateX(Math.PI/2)
    
      driveWay.translateX(-1.8677)
      driveWay.size = 0.05
      driveWay.name = "Driveway"
      driveWay.start = 56.25
      driveWay.end = 18
      
      driveWay.translateY(3)
      paintables.push(driveWay)
      

    let gun = await gltf.loadAsync('./models/watergun.glb')

    let guy = new Player()
    guy.gun = gun.scene

    let controller = new PlayerController(guy.mesh, canvas, world.active_camera, guy.gun, world.scene.children.slice(), graphicsGood? 10 : 15);

    guy.gun.scale.set(0.45, 0.45, 0.45)
    let painter = new Painter(paintables, world.renderer)

    
    
    guy.mesh.translateY(2)
    guy.mesh.translateZ(3)

    world.active_camera.lookAt(new T.Vector3(-3000, 0, 3000))
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
  let lastPaint = 0
    fancySign.stepWorld = (delta) =>{
      if(zoom){

        world.active_camera.fov = T.MathUtils.lerp(world.active_camera.fov, 45, .2)
        world.active_camera.updateProjectionMatrix();
      }
      else{
        world.active_camera.fov = T.MathUtils.lerp(world.active_camera.fov, 90, .2)
        world.active_camera.updateProjectionMatrix();
      }
      time+=delta
      lastPaint += delta
      world.active_camera.position.set(guy.mesh.position.x, guy.mesh.position.y, guy.mesh.position.z)
      controller.move(delta)
      if(isPainting && lastPaint > paintWait){
        lastPaint = 0
        
        painter.getPaintPoint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()))

        if(nozzleType == 1){
          world.camera.rotateX(Math.PI/32)
          painter.getPaintPoint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()))
          world.camera.rotateX(Math.PI/32)
          painter.getPaintPoint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()))
          world.camera.rotateX(-4*Math.PI/32)
          painter.getPaintPoint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()))
          world.camera.rotateX(Math.PI/32)
          painter.getPaintPoint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()))
          world.camera.rotateX(Math.PI/32)
        }
        else if (nozzleType == 2){
          world.camera.rotateY(Math.PI/32)
          painter.getPaintPoint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()))
          world.camera.rotateY(Math.PI/32)
          painter.getPaintPoint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()))
          world.camera.rotateY(-4*Math.PI/32)
          painter.getPaintPoint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()))
          world.camera.rotateY(Math.PI/32)
          painter.getPaintPoint(world.camera.getWorldPosition(new T.Vector3()), world.camera.getWorldDirection(new T.Vector3()))
          world.camera.rotateY(Math.PI/32)
        }

        
        let result = painter.paint()
        painter.clearPoints()
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
        canvas.focus()
    }
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

  canvas.addEventListener('keydown', function(event) {
    if(!event.repeat && event.code == 'ShiftLeft'){
          nozzleType = (nozzleType + 1) % 3
          updateCrosshairPosition()
          if(nozzleType == 0){
            painter.power = 1
          }
          else painter.power = .8
        }
  });

}


let graphicsGood = true;
let paintWait = 20;
const uiContainer = document.getElementById('uiContainer');
document.getElementById('startButton').addEventListener('click', function(){
    uiContainer.style.display = 'none';
    go(graphicsGood, paintWait);
});

const optionsButton = document.getElementById('optionsButton');
const closeOptionsButton = document.getElementById('closeOptionsButton');
// Event listener for the Options button
optionsButton.addEventListener('click', function() {
  optionsMenu.style.display = 'block'; // Show options menu
  uiContainer.style.display = 'none'; // Hide UI container
});

// Event listener for closing the options menu
closeOptionsButton.addEventListener('click', function() {
  optionsMenu.style.display = 'none'; // Hide options menu
  uiContainer.style.display = 'block'; // Show UI container again
});


const graphicsSelect = document.getElementById('graphicsSelect');
const paintSelect = document.getElementById('paintSelect');



graphicsSelect.addEventListener('change', function() {
  graphicsGood = graphicsSelect.value == "Good"
  console.log(graphicsGood)
});

paintSelect.addEventListener('change', function() {
  paintWait = paintSelect.value == "Good" ? 20: 80
  console.log(paintWait)
});