/**
 * ExhibitionSystem - Système d'exposition (inspiré de VExhibition)
 * JavaScript pur pour créer des espaces d'exposition virtuels
 */
import * as THREE from 'three';

export class ExhibitionSystem {
  constructor(engine3D) {
    this.engine = engine3D;
    this.exhibitions = new Map();
    this.artworks = new Map();
    this.walls = new Map();
    this.floors = new Map();
    
    this.eventListeners = new Map();
  }
  
  // Créer une salle d'exposition
  createExhibitionRoom(options = {}) {
    const id = options.id || `room_${Date.now()}`;
    const width = options.width || 10;
    const height = options.height || 3;
    const depth = options.depth || 10;
    
    const room = new THREE.Group();
    room.userData = { id, type: 'exhibition_room', ...options };
    
    // Sol
    const floorGeometry = new THREE.PlaneGeometry(width, depth);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: options.floorColor || 0xf0f0f0 
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    room.add(floor);
    
    // Murs
    const wallMaterial = new THREE.MeshLambertMaterial({ 
      color: options.wallColor || 0xffffff 
    });
    
    // Mur arrière
    const backWallGeometry = new THREE.PlaneGeometry(width, height);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, height/2, -depth/2);
    backWall.userData = { type: 'wall', side: 'back' };
    room.add(backWall);
    
    // Mur avant
    const frontWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    frontWall.position.set(0, height/2, depth/2);
    frontWall.rotation.y = Math.PI;
    frontWall.userData = { type: 'wall', side: 'front' };
    room.add(frontWall);
    
    // Mur gauche
    const sideWallGeometry = new THREE.PlaneGeometry(depth, height);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-width/2, height/2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.userData = { type: 'wall', side: 'left' };
    room.add(leftWall);
    
    // Mur droit
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(width/2, height/2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.userData = { type: 'wall', side: 'right' };
    room.add(rightWall);
    
    // Plafond (optionnel)
    if (options.ceiling !== false) {
      const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
      const ceilingMaterial = new THREE.MeshLambertMaterial({ 
        color: options.ceilingColor || 0xf8f8f8 
      });
      const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
      ceiling.position.y = height;
      ceiling.rotation.x = Math.PI / 2;
      room.add(ceiling);
    }
    
    this.engine.scene.add(room);
    this.exhibitions.set(id, room);
    
    this.emit('exhibitionRoomCreated', { id, room });
    
    return id;
  }
  
  // Ajouter une œuvre d'art
  addArtwork(options = {}) {
    const id = options.id || `artwork_${Date.now()}`;
    const width = options.width || 1;
    const height = options.height || 1;
    
    // Cadre
    const frameGroup = new THREE.Group();
    
    // Toile/Image
    const canvasGeometry = new THREE.PlaneGeometry(width, height);
    let canvasMaterial;
    
    if (options.imageUrl) {
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(options.imageUrl);
      canvasMaterial = new THREE.MeshLambertMaterial({ map: texture });
    } else {
      canvasMaterial = new THREE.MeshLambertMaterial({ 
        color: options.color || 0xffffff 
      });
    }
    
    const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
    frameGroup.add(canvas);
    
    // Cadre décoratif
    if (options.frame !== false) {
      const frameThickness = 0.05;
      const frameWidth = 0.1;
      
      const frameMaterial = new THREE.MeshLambertMaterial({ 
        color: options.frameColor || 0x8B4513 
      });
      
      // Cadre horizontal (haut et bas)
      const hFrameGeometry = new THREE.BoxGeometry(width + frameWidth*2, frameWidth, frameThickness);
      const topFrame = new THREE.Mesh(hFrameGeometry, frameMaterial);
      topFrame.position.y = height/2 + frameWidth/2;
      topFrame.position.z = -frameThickness/2;
      frameGroup.add(topFrame);
      
      const bottomFrame = new THREE.Mesh(hFrameGeometry, frameMaterial);
      bottomFrame.position.y = -height/2 - frameWidth/2;
      bottomFrame.position.z = -frameThickness/2;
      frameGroup.add(bottomFrame);
      
      // Cadre vertical (gauche et droite)
      const vFrameGeometry = new THREE.BoxGeometry(frameWidth, height, frameThickness);
      const leftFrame = new THREE.Mesh(vFrameGeometry, frameMaterial);
      leftFrame.position.x = -width/2 - frameWidth/2;
      leftFrame.position.z = -frameThickness/2;
      frameGroup.add(leftFrame);
      
      const rightFrame = new THREE.Mesh(vFrameGeometry, frameMaterial);
      rightFrame.position.x = width/2 + frameWidth/2;
      rightFrame.position.z = -frameThickness/2;
      frameGroup.add(rightFrame);
    }
    
    // Position de l'œuvre
    if (options.position) {
      frameGroup.position.set(
        options.position.x, 
        options.position.y, 
        options.position.z
      );
    }
    
    if (options.rotation) {
      frameGroup.rotation.set(
        options.rotation.x, 
        options.rotation.y, 
        options.rotation.z
      );
    }
    
    frameGroup.userData = { 
      id, 
      type: 'artwork',
      title: options.title || 'Sans titre',
      artist: options.artist || 'Artiste inconnu',
      description: options.description || '',
      ...options 
    };
    
    this.engine.scene.add(frameGroup);
    this.artworks.set(id, frameGroup);
    
    this.emit('artworkAdded', { id, artwork: frameGroup });
    
    return id;
  }
  
  // Ajouter un éclairage d'exposition
  addExhibitionLighting(options = {}) {
    const id = options.id || `light_${Date.now()}`;
    
    // Spot light pour éclairer les œuvres
    const spotLight = new THREE.SpotLight(
      options.color || 0xffffff,
      options.intensity || 1,
      options.distance || 10,
      options.angle || Math.PI / 6,
      options.penumbra || 0.1
    );
    
    spotLight.position.set(
      options.position?.x || 0,
      options.position?.y || 3,
      options.position?.z || 0
    );
    
    if (options.target) {
      spotLight.target.position.set(
        options.target.x,
        options.target.y,
        options.target.z
      );
      this.engine.scene.add(spotLight.target);
    }
    
    spotLight.castShadow = true;
    spotLight.userData = { id, type: 'exhibition_light', ...options };
    
    this.engine.scene.add(spotLight);
    
    this.emit('lightingAdded', { id, light: spotLight });
    
    return id;
  }
  
  // Créer un parcours de visite
  createVisitPath(points, options = {}) {
    const id = options.id || `path_${Date.now()}`;
    
    // Créer une ligne pour visualiser le parcours
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p.x, p.y, p.z))
    );
    
    const pathMaterial = new THREE.LineBasicMaterial({ 
      color: options.color || 0x00ff00,
      opacity: options.opacity || 0.5,
      transparent: true
    });
    
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    pathLine.userData = { id, type: 'visit_path', points, ...options };
    
    this.engine.scene.add(pathLine);
    
    this.emit('visitPathCreated', { id, path: pathLine, points });
    
    return id;
  }
  
  // Obtenir les informations d'une œuvre
  getArtworkInfo(id) {
    const artwork = this.artworks.get(id);
    if (artwork) {
      return {
        id,
        title: artwork.userData.title,
        artist: artwork.userData.artist,
        description: artwork.userData.description,
        position: artwork.position.clone(),
        rotation: artwork.rotation.clone()
      };
    }
    return null;
  }
  
  // Supprimer une œuvre
  removeArtwork(id) {
    const artwork = this.artworks.get(id);
    if (artwork) {
      this.engine.scene.remove(artwork);
      this.artworks.delete(id);
      this.emit('artworkRemoved', { id });
    }
  }
  
  // Supprimer une salle d'exposition
  removeExhibitionRoom(id) {
    const room = this.exhibitions.get(id);
    if (room) {
      this.engine.scene.remove(room);
      this.exhibitions.delete(id);
      this.emit('exhibitionRoomRemoved', { id });
    }
  }
  
  // Export de l'exposition
  exportExhibition() {
    return JSON.stringify({
      rooms: Array.from(this.exhibitions.entries()).map(([id, room]) => ({
        id,
        position: room.position.toArray(),
        rotation: room.rotation.toArray(),
        userData: room.userData
      })),
      artworks: Array.from(this.artworks.entries()).map(([id, artwork]) => ({
        id,
        position: artwork.position.toArray(),
        rotation: artwork.rotation.toArray(),
        userData: artwork.userData
      }))
    });
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
  
  // Nettoyage
  dispose() {
    this.exhibitions.forEach((room, id) => this.removeExhibitionRoom(id));
    this.artworks.forEach((artwork, id) => this.removeArtwork(id));
    this.eventListeners.clear();
  }
}