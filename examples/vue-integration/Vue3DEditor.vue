<!--
  Exemple d'intégration Vue.js avec la bibliothèque JavaScript pure
-->
<template>
  <div class="editor-container">
    <!-- Container pour le canvas 3D -->
    <div ref="canvasContainer" class="canvas-container"></div>
    
    <!-- Interface utilisateur Vue -->
    <div class="ui-panel">
      <h2>3D Editor - Intégration Vue.js</h2>
      
      <div class="button-group">
        <h3>Objets 3D</h3>
        <button @click="addCube" class="btn">Ajouter Cube</button>
        <button @click="addSphere" class="btn">Ajouter Sphère</button>
        <button @click="addCylinder" class="btn">Ajouter Cylindre</button>
      </div>
      
      <div class="button-group">
        <h3>Avatars</h3>
        <button @click="createAvatar" class="btn">Créer Avatar</button>
        <input 
          type="file" 
          ref="avatarFile" 
          @change="loadAvatar" 
          accept=".glb,.gltf" 
          style="display: none"
        >
        <button @click="$refs.avatarFile.click()" class="btn btn-success">
          Charger Avatar
        </button>
      </div>
      
      <div class="button-group">
        <h3>Exposition</h3>
        <button @click="createRoom" class="btn">Créer Salle</button>
        <button @click="addArtwork" class="btn">Ajouter Œuvre</button>
        <button @click="addLighting" class="btn">Ajouter Éclairage</button>
      </div>
      
      <div class="button-group">
        <h3>Interactions</h3>
        <button @click="create3DButton" class="btn">Bouton 3D</button>
        <button @click="createZone" class="btn">Zone Interactive</button>
      </div>
      
      <div class="button-group">
        <h3>Outils</h3>
        <button 
          @click="setMode('translate')" 
          :class="['btn', { active: transformMode === 'translate' }]"
        >
          Déplacer (W)
        </button>
        <button 
          @click="setMode('rotate')" 
          :class="['btn', { active: transformMode === 'rotate' }]"
        >
          Rotation (E)
        </button>
        <button 
          @click="setMode('scale')" 
          :class="['btn', { active: transformMode === 'scale' }]"
        >
          Échelle (R)
        </button>
      </div>
      
      <div class="button-group">
        <h3>Scène</h3>
        <button @click="exportScene" class="btn">Exporter</button>
        <input 
          type="file" 
          ref="sceneFile" 
          @change="importScene" 
          accept=".json" 
          style="display: none"
        >
        <button @click="$refs.sceneFile.click()" class="btn btn-success">
          Importer
        </button>
      </div>
      
      <div class="stats">
        <div>Objets: {{ stats.objects }}</div>
        <div>Avatars: {{ stats.avatars }}</div>
        <div>Version: {{ version }}</div>
        <div v-if="selectedObject" class="selected">
          Sélectionné: {{ selectedObject }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Editor3D from '../../lib/3DEditor.js';

export default {
  name: 'Vue3DEditor',
  data() {
    return {
      editor: null,
      stats: { objects: 0, avatars: 0, exhibitions: 0, artworks: 0 },
      selectedObject: null,
      transformMode: 'translate',
      version: '1.0.0'
    };
  },
  mounted() {
    this.initEditor();
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.dispose();
    }
  },
  methods: {
    initEditor() {
      // Initialiser l'éditeur 3D
      this.editor = new Editor3D(this.$refs.canvasContainer, {
        enableShadows: true,
        enableGrid: true,
        backgroundColor: 0x1a1a1a
      });
      
      // Écouter les événements
      this.editor.on('objectAdded', this.updateStats);
      this.editor.on('objectRemoved', this.updateStats);
      this.editor.on('objectSelected', (data) => {
        this.selectedObject = data.id;
      });
      this.editor.on('objectDeselected', () => {
        this.selectedObject = null;
      });
      this.editor.on('transformModeChanged', (data) => {
        this.transformMode = data.mode;
      });
      
      this.version = this.editor.getVersion();
      this.updateStats();
    },
    
    updateStats() {
      if (this.editor) {
        this.stats = this.editor.getStats();
      }
    },
    
    addCube() {
      const id = this.editor.addCube({
        position: { 
          x: Math.random() * 4 - 2, 
          y: 0.5, 
          z: Math.random() * 4 - 2 
        },
        color: Math.random() * 0xffffff
      });
      
      this.editor.makeObjectInteractive(id, {
        onClick: (object) => {
          this.editor.selectObject(object.userData.id);
        }
      });
    },
    
    addSphere() {
      const id = this.editor.addSphere({
        position: { 
          x: Math.random() * 4 - 2, 
          y: 0.5, 
          z: Math.random() * 4 - 2 
        },
        color: Math.random() * 0xffffff
      });
      
      this.editor.makeObjectInteractive(id, {
        onClick: (object) => {
          this.editor.selectObject(object.userData.id);
        }
      });
    },
    
    addCylinder() {
      const id = this.editor.addCylinder({
        position: { 
          x: Math.random() * 4 - 2, 
          y: 0.5, 
          z: Math.random() * 4 - 2 
        },
        color: Math.random() * 0xffffff
      });
      
      this.editor.makeObjectInteractive(id, {
        onClick: (object) => {
          this.editor.selectObject(object.userData.id);
        }
      });
    },
    
    createAvatar() {
      this.editor.createAvatar({
        position: { 
          x: Math.random() * 4 - 2, 
          y: 0, 
          z: Math.random() * 4 - 2 
        },
        bodyColor: Math.random() * 0xffffff
      });
    },
    
    async loadAvatar(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          await this.editor.loadAvatarFromFile(file, {
            position: { x: 0, y: 0, z: 0 }
          });
          console.log('Avatar chargé avec succès');
        } catch (error) {
          console.error('Erreur lors du chargement de l\'avatar:', error);
        }
      }
    },
    
    createRoom() {
      this.editor.createExhibitionRoom({
        width: 8,
        height: 3,
        depth: 8,
        wallColor: 0xf0f0f0,
        floorColor: 0xe0e0e0
      });
    },
    
    addArtwork() {
      this.editor.addArtwork({
        width: 1.5,
        height: 1,
        position: { x: -3.5, y: 1.5, z: 0 },
        title: 'Œuvre d\'art Vue.js',
        artist: 'Artiste virtuel',
        color: Math.random() * 0xffffff
      });
    },
    
    addLighting() {
      this.editor.addExhibitionLighting({
        position: { x: 0, y: 2.5, z: 2 },
        target: { x: -3.5, y: 1.5, z: 0 },
        intensity: 1.5
      });
    },
    
    create3DButton() {
      this.editor.create3DButton('Bouton Vue!', 
        { x: 2, y: 1, z: 2 },
        {
          onClick: () => {
            alert('Bouton 3D Vue.js cliqué!');
          }
        }
      );
    },
    
    createZone() {
      this.editor.createInteractionZone(
        { x: 0, y: 0.5, z: -2 },
        { x: 2, y: 1, z: 2 },
        {
          onClick: () => {
            console.log('Zone interactive Vue.js activée!');
          },
          debug: true
        }
      );
    },
    
    setMode(mode) {
      this.editor.setTransformMode(mode);
    },
    
    exportScene() {
      const sceneData = this.editor.exportScene();
      const blob = new Blob([sceneData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vue-scene.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    
    importScene(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            this.editor.importScene(e.target.result);
            console.log('Scène importée avec succès');
          } catch (error) {
            console.error('Erreur lors de l\'import:', error);
          }
        };
        reader.readAsText(file);
      }
    }
  }
};
</script>

<style scoped>
.editor-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: #1a1a1a;
}

.canvas-container {
  width: 100%;
  height: 100%;
}

.ui-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 10px;
  min-width: 250px;
  font-family: Arial, sans-serif;
}

.button-group {
  margin-bottom: 15px;
}

.button-group h3 {
  margin: 0 0 10px 0;
  color: #4A90E2;
}

.btn {
  background: #4A90E2;
  color: white;
  border: none;
  padding: 8px 15px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn:hover {
  background: #5BA0F2;
}

.btn.active {
  background: #28a745;
}

.btn-success {
  background: #28a745;
}

.btn-success:hover {
  background: #34ce57;
}

.stats {
  margin-top: 20px;
  font-size: 14px;
}

.stats div {
  margin-bottom: 5px;
}

.selected {
  color: #4A90E2;
  font-weight: bold;
}
</style>