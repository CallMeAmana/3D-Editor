/**
 * Engine3D - Moteur 3D principal (JavaScript pur)
 * Inspiré de Unity pour les transformations fluides
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export class Engine3D {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      enableShadows: true,
      enableGrid: true,
      backgroundColor: 0x1a1a1a,
      ...options
    };
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.transformControls = null;
    
    this.objects = new Map();
    this.selectedObject = null;
    this.transformMode = 'translate'; // translate, rotate, scale
    
    this.eventListeners = new Map();
    
    this.init();
  }
  
  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.setupLighting();
    this.setupGrid();
    this.setupEventListeners();
    this.animate();
  }
  
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.options.backgroundColor);
  }
  
  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
  }
  
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = this.options.enableShadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }
  
  setupControls() {
    // Contrôles de caméra (style Unity)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Contrôles de transformation d'objets
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.controls.enabled = !event.value;
    });
    this.scene.add(this.transformControls);
  }
  
  setupLighting() {
    // Éclairage ambiant
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);
    
    // Lumière directionnelle avec ombres
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }
  
  setupGrid() {
    if (this.options.enableGrid) {
      const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x444444);
      this.scene.add(gridHelper);
    }
  }
  
  setupEventListeners() {
    // Gestion du redimensionnement
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Gestion des clics pour sélection
    this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
    
    // Gestion des touches (comme Unity)
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
  }
  
  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  onMouseClick(event) {
    const mouse = new THREE.Vector2();
    const rect = this.renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    
    const intersects = raycaster.intersectObjects(Array.from(this.objects.values()));
    
    if (intersects.length > 0) {
      this.selectObject(intersects[0].object.userData.id);
    } else {
      this.deselectObject();
    }
  }
  
  onKeyDown(event) {
    // Raccourcis clavier style Unity
    switch(event.key.toLowerCase()) {
      case 'w':
        this.setTransformMode('translate');
        break;
      case 'e':
        this.setTransformMode('rotate');
        break;
      case 'r':
        this.setTransformMode('scale');
        break;
      case 'delete':
      case 'backspace':
        if (this.selectedObject) {
          this.removeObject(this.selectedObject.userData.id);
        }
        break;
    }
  }
  
  // API publique pour la gestion des objets
  addObject(type, options = {}) {
    const id = options.id || `object_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let geometry;
    switch(type) {
      case 'box':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        break;
      case 'plane':
        geometry = new THREE.PlaneGeometry(1, 1);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    
    const material = new THREE.MeshLambertMaterial({ 
      color: options.color || 0x4F46E5 
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { id, type, ...options };
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Position initiale
    if (options.position) {
      mesh.position.set(options.position.x, options.position.y, options.position.z);
    }
    
    this.scene.add(mesh);
    this.objects.set(id, mesh);
    
    this.emit('objectAdded', { id, type, mesh });
    
    return id;
  }
  
  removeObject(id) {
    const object = this.objects.get(id);
    if (object) {
      this.scene.remove(object);
      this.objects.delete(id);
      
      if (this.selectedObject === object) {
        this.deselectObject();
      }
      
      this.emit('objectRemoved', { id });
    }
  }
  
  selectObject(id) {
    const object = this.objects.get(id);
    if (object) {
      this.selectedObject = object;
      this.transformControls.attach(object);
      this.emit('objectSelected', { id, object });
    }
  }
  
  deselectObject() {
    this.selectedObject = null;
    this.transformControls.detach();
    this.emit('objectDeselected');
  }
  
  setTransformMode(mode) {
    this.transformMode = mode;
    this.transformControls.setMode(mode);
    this.emit('transformModeChanged', { mode });
  }
  
  updateObject(id, properties) {
    const object = this.objects.get(id);
    if (!object) return;
    
    if (properties.position) {
      object.position.set(properties.position.x, properties.position.y, properties.position.z);
    }
    
    if (properties.rotation) {
      object.rotation.set(properties.rotation.x, properties.rotation.y, properties.rotation.z);
    }
    
    if (properties.scale) {
      object.scale.set(properties.scale.x, properties.scale.y, properties.scale.z);
    }
    
    if (properties.color) {
      object.material.color.setHex(properties.color);
    }
    
    this.emit('objectUpdated', { id, properties });
  }
  
  // Système d'événements
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }
  
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => callback(data));
    }
  }
  
  // Boucle d'animation
  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  
  // Nettoyage
  dispose() {
    this.renderer.dispose();
    this.controls.dispose();
    this.transformControls.dispose();
    this.eventListeners.clear();
    this.objects.clear();
  }
  
  // Export/Import de scène
  exportScene() {
    const sceneData = {
      objects: Array.from(this.objects.entries()).map(([id, mesh]) => ({
        id,
        type: mesh.userData.type,
        position: mesh.position.toArray(),
        rotation: mesh.rotation.toArray(),
        scale: mesh.scale.toArray(),
        color: mesh.material.color.getHex()
      }))
    };
    return JSON.stringify(sceneData);
  }
  
  importScene(sceneData) {
    const data = JSON.parse(sceneData);
    
    // Nettoyer la scène actuelle
    this.objects.forEach((mesh, id) => this.removeObject(id));
    
    // Recréer les objets
    data.objects.forEach(objData => {
      const id = this.addObject(objData.type, {
        id: objData.id,
        color: objData.color
      });
      
      this.updateObject(id, {
        position: { x: objData.position[0], y: objData.position[1], z: objData.position[2] },
        rotation: { x: objData.rotation[0], y: objData.rotation[1], z: objData.rotation[2] },
        scale: { x: objData.scale[0], y: objData.scale[1], z: objData.scale[2] }
      });
    });
  }
}