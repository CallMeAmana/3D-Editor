/**
 * 3DEditor - Bibliothèque principale
 * Point d'entrée unique pour la bibliothèque JavaScript pure
 */
import { Engine3D } from './core/Engine3D.js';
import { AvatarSystem } from './modules/AvatarSystem.js';
import { ExhibitionSystem } from './modules/ExhibitionSystem.js';
import { InteractionSystem } from './modules/InteractionSystem.js';

export class Editor3D {
  constructor(container, options = {}) {
    // Initialiser le moteur 3D
    this.engine = new Engine3D(container, options);
    
    // Initialiser les modules
    this.avatars = new AvatarSystem(this.engine);
    this.exhibitions = new ExhibitionSystem(this.engine);
    this.interactions = new InteractionSystem(this.engine);
    
    // État de l'éditeur
    this.isInitialized = true;
    this.version = '1.0.0';
    
    // Événements globaux
    this.eventListeners = new Map();
    
    // Connecter les événements des modules
    this.setupModuleEvents();
  }
  
  setupModuleEvents() {
    // Relayer les événements des modules vers l'éditeur principal
    this.engine.on('objectAdded', (data) => this.emit('objectAdded', data));
    this.engine.on('objectSelected', (data) => this.emit('objectSelected', data));
    this.engine.on('objectRemoved', (data) => this.emit('objectRemoved', data));
    
    this.avatars.on('avatarCreated', (data) => this.emit('avatarCreated', data));
    this.avatars.on('avatarMoved', (data) => this.emit('avatarMoved', data));
    
    this.exhibitions.on('artworkAdded', (data) => this.emit('artworkAdded', data));
    this.exhibitions.on('exhibitionRoomCreated', (data) => this.emit('exhibitionRoomCreated', data));
    
    this.interactions.on('objectClicked', (data) => this.emit('objectClicked', data));
    this.interactions.on('objectHoverStart', (data) => this.emit('objectHoverStart', data));
  }
  
  // API simplifiée pour les utilisateurs
  
  // Gestion des objets 3D
  addCube(options = {}) {
    return this.engine.addObject('box', options);
  }
  
  addSphere(options = {}) {
    return this.engine.addObject('sphere', options);
  }
  
  addCylinder(options = {}) {
    return this.engine.addObject('cylinder', options);
  }
  
  removeObject(id) {
    return this.engine.removeObject(id);
  }
  
  selectObject(id) {
    return this.engine.selectObject(id);
  }
  
  updateObject(id, properties) {
    return this.engine.updateObject(id, properties);
  }
  
  // Gestion des avatars
  createAvatar(options = {}) {
    return this.avatars.createSimpleAvatar(options);
  }
  
  loadAvatarFromFile(file, options = {}) {
    return this.avatars.loadAvatar(file, options);
  }
  
  moveAvatar(id, position, duration) {
    return this.avatars.moveAvatar(id, position, duration);
  }
  
  // Gestion des expositions
  createExhibitionRoom(options = {}) {
    return this.exhibitions.createExhibitionRoom(options);
  }
  
  addArtwork(options = {}) {
    return this.exhibitions.addArtwork(options);
  }
  
  addExhibitionLighting(options = {}) {
    return this.exhibitions.addExhibitionLighting(options);
  }
  
  // Gestion des interactions
  makeObjectInteractive(objectId, options = {}) {
    return this.interactions.makeInteractive(objectId, options);
  }
  
  create3DButton(text, position, options = {}) {
    return this.interactions.create3DButton(text, position, options);
  }
  
  createInteractionZone(position, size, options = {}) {
    return this.interactions.createInteractionZone(position, size, options);
  }
  
  // Contrôles de transformation (style Unity)
  setTransformMode(mode) {
    return this.engine.setTransformMode(mode);
  }
  
  // Export/Import
  exportScene() {
    return this.engine.exportScene();
  }
  
  importScene(sceneData) {
    return this.engine.importScene(sceneData);
  }
  
  exportExhibition() {
    return this.exhibitions.exportExhibition();
  }
  
  // Utilitaires
  getVersion() {
    return this.version;
  }
  
  getStats() {
    return {
      objects: this.engine.objects.size,
      avatars: this.avatars.avatars.size,
      exhibitions: this.exhibitions.exhibitions.size,
      artworks: this.exhibitions.artworks.size
    };
  }
  
  // Système d'événements global
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
  
  // Nettoyage complet
  dispose() {
    this.engine.dispose();
    this.avatars.dispose();
    this.exhibitions.dispose();
    this.interactions.dispose();
    this.eventListeners.clear();
  }
}

// Export par défaut pour faciliter l'importation
export default Editor3D;

// Exports nommés pour un usage avancé
export { Engine3D, AvatarSystem, ExhibitionSystem, InteractionSystem };