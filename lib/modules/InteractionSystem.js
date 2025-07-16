/**
 * InteractionSystem - Système d'interactions
 * JavaScript pur pour gérer les interactions utilisateur
 */
import * as THREE from 'three';

export class InteractionSystem {
  constructor(engine3D) {
    this.engine = engine3D;
    this.interactiveObjects = new Map();
    this.hoveredObject = null;
    this.clickedObject = null;
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.eventListeners = new Map();
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    const canvas = this.engine.renderer.domElement;
    
    canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
    canvas.addEventListener('click', (event) => this.onClick(event));
    canvas.addEventListener('dblclick', (event) => this.onDoubleClick(event));
    canvas.addEventListener('contextmenu', (event) => this.onRightClick(event));
  }
  
  // Rendre un objet interactif
  makeInteractive(objectId, options = {}) {
    const object = this.engine.objects.get(objectId);
    if (!object) return;
    
    const interactionData = {
      id: objectId,
      object,
      hoverable: options.hoverable !== false,
      clickable: options.clickable !== false,
      doubleClickable: options.doubleClickable || false,
      rightClickable: options.rightClickable || false,
      hoverColor: options.hoverColor || 0x00ff00,
      originalColor: object.material.color.getHex(),
      tooltip: options.tooltip || null,
      onClick: options.onClick || null,
      onDoubleClick: options.onDoubleClick || null,
      onRightClick: options.onRightClick || null,
      onHover: options.onHover || null,
      onHoverEnd: options.onHoverEnd || null,
      ...options
    };
    
    this.interactiveObjects.set(objectId, interactionData);
    
    this.emit('objectMadeInteractive', { id: objectId, options });
  }
  
  // Supprimer l'interactivité d'un objet
  removeInteractivity(objectId) {
    const interactionData = this.interactiveObjects.get(objectId);
    if (interactionData) {
      // Restaurer la couleur originale
      interactionData.object.material.color.setHex(interactionData.originalColor);
      this.interactiveObjects.delete(objectId);
      
      this.emit('interactivityRemoved', { id: objectId });
    }
  }
  
  onMouseMove(event) {
    this.updateMousePosition(event);
    this.checkHover();
  }
  
  onClick(event) {
    this.updateMousePosition(event);
    const intersectedObject = this.getIntersectedObject();
    
    if (intersectedObject) {
      const interactionData = this.interactiveObjects.get(intersectedObject.userData.id);
      
      if (interactionData && interactionData.clickable) {
        this.clickedObject = intersectedObject;
        
        // Callback personnalisé
        if (interactionData.onClick) {
          interactionData.onClick(intersectedObject, event);
        }
        
        this.emit('objectClicked', { 
          object: intersectedObject, 
          interactionData,
          event 
        });
      }
    }
  }
  
  onDoubleClick(event) {
    this.updateMousePosition(event);
    const intersectedObject = this.getIntersectedObject();
    
    if (intersectedObject) {
      const interactionData = this.interactiveObjects.get(intersectedObject.userData.id);
      
      if (interactionData && interactionData.doubleClickable) {
        // Callback personnalisé
        if (interactionData.onDoubleClick) {
          interactionData.onDoubleClick(intersectedObject, event);
        }
        
        this.emit('objectDoubleClicked', { 
          object: intersectedObject, 
          interactionData,
          event 
        });
      }
    }
  }
  
  onRightClick(event) {
    event.preventDefault();
    this.updateMousePosition(event);
    const intersectedObject = this.getIntersectedObject();
    
    if (intersectedObject) {
      const interactionData = this.interactiveObjects.get(intersectedObject.userData.id);
      
      if (interactionData && interactionData.rightClickable) {
        // Callback personnalisé
        if (interactionData.onRightClick) {
          interactionData.onRightClick(intersectedObject, event);
        }
        
        this.emit('objectRightClicked', { 
          object: intersectedObject, 
          interactionData,
          event 
        });
      }
    }
  }
  
  checkHover() {
    const intersectedObject = this.getIntersectedObject();
    
    // Si on survole un nouvel objet
    if (intersectedObject && intersectedObject !== this.hoveredObject) {
      // Terminer le hover précédent
      if (this.hoveredObject) {
        this.endHover();
      }
      
      // Commencer le nouveau hover
      this.startHover(intersectedObject);
    }
    // Si on ne survole plus rien
    else if (!intersectedObject && this.hoveredObject) {
      this.endHover();
    }
  }
  
  startHover(object) {
    const interactionData = this.interactiveObjects.get(object.userData.id);
    
    if (interactionData && interactionData.hoverable) {
      this.hoveredObject = object;
      
      // Changer la couleur
      object.material.color.setHex(interactionData.hoverColor);
      
      // Changer le curseur
      this.engine.renderer.domElement.style.cursor = 'pointer';
      
      // Callback personnalisé
      if (interactionData.onHover) {
        interactionData.onHover(object);
      }
      
      this.emit('objectHoverStart', { object, interactionData });
    }
  }
  
  endHover() {
    if (this.hoveredObject) {
      const interactionData = this.interactiveObjects.get(this.hoveredObject.userData.id);
      
      if (interactionData) {
        // Restaurer la couleur originale
        this.hoveredObject.material.color.setHex(interactionData.originalColor);
        
        // Callback personnalisé
        if (interactionData.onHoverEnd) {
          interactionData.onHoverEnd(this.hoveredObject);
        }
        
        this.emit('objectHoverEnd', { 
          object: this.hoveredObject, 
          interactionData 
        });
      }
      
      // Restaurer le curseur
      this.engine.renderer.domElement.style.cursor = 'default';
      
      this.hoveredObject = null;
    }
  }
  
  updateMousePosition(event) {
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
  
  getIntersectedObject() {
    this.raycaster.setFromCamera(this.mouse, this.engine.camera);
    
    const interactiveObjectsList = Array.from(this.interactiveObjects.values())
      .map(data => data.object);
    
    const intersects = this.raycaster.intersectObjects(interactiveObjectsList);
    
    return intersects.length > 0 ? intersects[0].object : null;
  }
  
  // Créer une zone d'interaction invisible
  createInteractionZone(position, size, options = {}) {
    const id = options.id || `zone_${Date.now()}`;
    
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      opacity: 0,
      visible: options.debug || false
    });
    
    const zone = new THREE.Mesh(geometry, material);
    zone.position.set(position.x, position.y, position.z);
    zone.userData = { id, type: 'interaction_zone', ...options };
    
    this.engine.scene.add(zone);
    this.engine.objects.set(id, zone);
    
    // Rendre la zone interactive
    this.makeInteractive(id, {
      hoverable: false,
      ...options
    });
    
    this.emit('interactionZoneCreated', { id, zone });
    
    return id;
  }
  
  // Créer un bouton 3D
  create3DButton(text, position, options = {}) {
    const id = options.id || `button_${Date.now()}`;
    
    // Géométrie du bouton
    const buttonGeometry = new THREE.BoxGeometry(
      options.width || 2,
      options.height || 0.5,
      options.depth || 0.2
    );
    
    const buttonMaterial = new THREE.MeshLambertMaterial({ 
      color: options.color || 0x4A90E2 
    });
    
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(position.x, position.y, position.z);
    button.userData = { id, type: '3d_button', text, ...options };
    
    // Ajouter du texte (simplifié - peut être amélioré avec TextGeometry)
    if (text && options.showText !== false) {
      // Pour l'instant, on utilise un plan avec du texte
      // Dans une vraie implémentation, on utiliserait TextGeometry ou un canvas
      const textPlane = new THREE.PlaneGeometry(options.width || 2, options.height || 0.5);
      const textMaterial = new THREE.MeshBasicMaterial({ 
        color: options.textColor || 0xffffff 
      });
      const textMesh = new THREE.Mesh(textPlane, textMaterial);
      textMesh.position.z = 0.11;
      button.add(textMesh);
    }
    
    this.engine.scene.add(button);
    this.engine.objects.set(id, button);
    
    // Rendre le bouton interactif
    this.makeInteractive(id, {
      hoverColor: options.hoverColor || 0x5BA0F2,
      onClick: options.onClick,
      ...options
    });
    
    this.emit('3dButtonCreated', { id, button, text });
    
    return id;
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
    this.interactiveObjects.clear();
    this.eventListeners.clear();
    this.hoveredObject = null;
    this.clickedObject = null;
  }
}