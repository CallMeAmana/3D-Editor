/**
 * AvatarSystem - Système d'avatars (inspiré de Spatial.io)
 * JavaScript pur, indépendant de tout framework
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AvatarSystem {
  constructor(engine3D) {
    this.engine = engine3D;
    this.avatars = new Map();
    this.loader = new GLTFLoader();
    this.currentAvatar = null;
    
    this.eventListeners = new Map();
  }
  
  // Créer un avatar simple (cube coloré pour commencer)
  createSimpleAvatar(options = {}) {
    const id = options.id || `avatar_${Date.now()}`;
    
    // Corps principal
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: options.bodyColor || 0x4A90E2 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    
    // Tête
    const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ 
      color: options.skinColor || 0xFFDBB3 
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.4;
    
    // Groupe avatar
    const avatarGroup = new THREE.Group();
    avatarGroup.add(body);
    avatarGroup.add(head);
    avatarGroup.userData = { 
      id, 
      type: 'avatar',
      isAvatar: true,
      ...options 
    };
    
    // Position initiale
    if (options.position) {
      avatarGroup.position.set(
        options.position.x, 
        options.position.y, 
        options.position.z
      );
    }
    
    this.engine.scene.add(avatarGroup);
    this.avatars.set(id, avatarGroup);
    
    this.emit('avatarCreated', { id, avatar: avatarGroup });
    
    return id;
  }
  
  // Charger un avatar depuis un fichier GLTF/GLB
  loadAvatar(file, options = {}) {
    return new Promise((resolve, reject) => {
      const id = options.id || `avatar_${Date.now()}`;
      const url = URL.createObjectURL(file);
      
      this.loader.load(
        url,
        (gltf) => {
          const avatar = gltf.scene;
          avatar.userData = { 
            id, 
            type: 'avatar',
            isAvatar: true,
            ...options 
          };
          
          // Ajuster la taille
          const box = new THREE.Box3().setFromObject(avatar);
          const size = box.getSize(new THREE.Vector3());
          const scale = (options.height || 1.8) / size.y;
          avatar.scale.setScalar(scale);
          
          // Position initiale
          if (options.position) {
            avatar.position.set(
              options.position.x, 
              options.position.y, 
              options.position.z
            );
          }
          
          this.engine.scene.add(avatar);
          this.avatars.set(id, avatar);
          
          URL.revokeObjectURL(url);
          
          this.emit('avatarLoaded', { id, avatar });
          resolve(id);
        },
        undefined,
        (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        }
      );
    });
  }
  
  // Déplacer un avatar
  moveAvatar(id, position, duration = 1000) {
    const avatar = this.avatars.get(id);
    if (!avatar) return;
    
    // Animation simple (peut être améliorée avec une bibliothèque d'animation)
    const startPos = avatar.position.clone();
    const endPos = new THREE.Vector3(position.x, position.y, position.z);
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Interpolation linéaire
      avatar.position.lerpVectors(startPos, endPos, progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.emit('avatarMoved', { id, position: endPos });
      }
    };
    
    animate();
  }
  
  // Faire regarder un avatar vers une direction
  lookAt(id, target) {
    const avatar = this.avatars.get(id);
    if (!avatar) return;
    
    const targetVector = new THREE.Vector3(target.x, avatar.position.y, target.z);
    avatar.lookAt(targetVector);
    
    this.emit('avatarLookAt', { id, target });
  }
  
  // Définir l'avatar actuel (pour la caméra à la première personne)
  setCurrentAvatar(id) {
    this.currentAvatar = id;
    const avatar = this.avatars.get(id);
    
    if (avatar) {
      // Positionner la caméra derrière l'avatar
      const cameraOffset = new THREE.Vector3(0, 1.6, 3);
      const worldOffset = cameraOffset.clone().applyMatrix4(avatar.matrixWorld);
      
      this.engine.camera.position.copy(worldOffset);
      this.engine.camera.lookAt(avatar.position);
      
      this.emit('currentAvatarChanged', { id, avatar });
    }
  }
  
  // Supprimer un avatar
  removeAvatar(id) {
    const avatar = this.avatars.get(id);
    if (avatar) {
      this.engine.scene.remove(avatar);
      this.avatars.delete(id);
      
      if (this.currentAvatar === id) {
        this.currentAvatar = null;
      }
      
      this.emit('avatarRemoved', { id });
    }
  }
  
  // Obtenir tous les avatars
  getAllAvatars() {
    return Array.from(this.avatars.entries()).map(([id, avatar]) => ({
      id,
      avatar,
      position: avatar.position.clone(),
      rotation: avatar.rotation.clone()
    }));
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
  
  // Export des avatars
  exportAvatars() {
    return JSON.stringify({
      avatars: Array.from(this.avatars.entries()).map(([id, avatar]) => ({
        id,
        position: avatar.position.toArray(),
        rotation: avatar.rotation.toArray(),
        scale: avatar.scale.toArray(),
        userData: avatar.userData
      }))
    });
  }
  
  // Nettoyage
  dispose() {
    this.avatars.forEach((avatar, id) => this.removeAvatar(id));
    this.eventListeners.clear();
  }
}