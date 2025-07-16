# 3D Editor - Bibliothèque JavaScript Pure et Modulaire

Une bibliothèque 3D complète et indépendante de tout framework, combinant :
- **Workflow fluide de Unity** pour les transformations d'objets
- **Templates immersifs et avatars de Spatial.io** 
- **Fonctionnalités d'exposition de VExhibition**

## 🎯 Objectif Principal

Créer une bibliothèque JavaScript **pure et modulaire** qui peut être intégrée facilement dans n'importe quelle technologie (React, Vue, Angular, vanilla JS, etc.).

## 🏗️ Architecture

```
lib/
├── core/
│   └── Engine3D.js          # Moteur 3D principal (Three.js)
├── modules/
│   ├── AvatarSystem.js      # Système d'avatars (inspiré Spatial.io)
│   ├── ExhibitionSystem.js  # Système d'exposition (inspiré VExhibition)
│   └── InteractionSystem.js # Système d'interactions
└── 3DEditor.js             # Point d'entrée principal

examples/
├── vanilla-js/             # Exemple JavaScript pur
├── react-integration/      # Exemple intégration React
└── vue-integration/        # Exemple intégration Vue.js
```

## 🚀 Installation et Utilisation

### JavaScript Pur (Vanilla)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mon Éditeur 3D</title>
</head>
<body>
    <div id="canvas-container"></div>
    
    <script type="module">
        import Editor3D from './lib/3DEditor.js';
        
        // Initialiser l'éditeur
        const container = document.getElementById('canvas-container');
        const editor = new Editor3D(container);
        
        // Ajouter des objets
        const cubeId = editor.addCube({
            position: { x: 0, y: 0.5, z: 0 },
            color: 0x4F46E5
        });
        
        // Rendre interactif
        editor.makeObjectInteractive(cubeId, {
            onClick: (object) => {
                console.log('Cube cliqué!');
            }
        });
        
        // Créer un avatar
        editor.createAvatar({
            position: { x: 2, y: 0, z: 0 }
        });
        
        // Créer une salle d'exposition
        editor.createExhibitionRoom({
            width: 10,
            height: 3,
            depth: 10
        });
    </script>
</body>
</html>
```

### Intégration React

```jsx
import React, { useEffect, useRef } from 'react';
import Editor3D from './lib/3DEditor.js';

const MyComponent = () => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    // Initialiser l'éditeur
    editorRef.current = new Editor3D(containerRef.current);
    
    // Écouter les événements
    editorRef.current.on('objectClicked', (data) => {
      console.log('Objet cliqué:', data);
    });

    return () => {
      editorRef.current.dispose();
    };
  }, []);

  const addCube = () => {
    editorRef.current.addCube({
      position: { x: Math.random() * 4 - 2, y: 0.5, z: Math.random() * 4 - 2 }
    });
  };

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
      <button onClick={addCube}>Ajouter Cube</button>
    </div>
  );
};
```

### Intégration Vue.js

```vue
<template>
  <div>
    <div ref="canvasContainer" class="canvas-container"></div>
    <button @click="addCube">Ajouter Cube</button>
  </div>
</template>

<script>
import Editor3D from './lib/3DEditor.js';

export default {
  data() {
    return {
      editor: null
    };
  },
  mounted() {
    this.editor = new Editor3D(this.$refs.canvasContainer);
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.dispose();
    }
  },
  methods: {
    addCube() {
      this.editor.addCube({
        position: { x: 0, y: 0.5, z: 0 }
      });
    }
  }
};
</script>
```

## 🎮 API Principale

### Gestion des Objets 3D

```javascript
// Ajouter des primitives
const cubeId = editor.addCube(options);
const sphereId = editor.addSphere(options);
const cylinderId = editor.addCylinder(options);

// Manipuler les objets
editor.selectObject(id);
editor.updateObject(id, { position: { x: 1, y: 0, z: 0 } });
editor.removeObject(id);

// Modes de transformation (style Unity)
editor.setTransformMode('translate'); // W
editor.setTransformMode('rotate');    // E
editor.setTransformMode('scale');     // R
```

### Système d'Avatars (inspiré Spatial.io)

```javascript
// Créer un avatar simple
const avatarId = editor.createAvatar({
  position: { x: 0, y: 0, z: 0 },
  bodyColor: 0x4A90E2
});

// Charger un avatar depuis un fichier
editor.loadAvatarFromFile(file, options)
  .then(avatarId => {
    console.log('Avatar chargé:', avatarId);
  });

// Déplacer un avatar
editor.moveAvatar(avatarId, { x: 5, y: 0, z: 5 }, 2000);
```

### Système d'Exposition (inspiré VExhibition)

```javascript
// Créer une salle d'exposition
const roomId = editor.createExhibitionRoom({
  width: 10,
  height: 3,
  depth: 8,
  wallColor: 0xffffff,
  floorColor: 0xf0f0f0
});

// Ajouter une œuvre d'art
const artworkId = editor.addArtwork({
  width: 1.5,
  height: 1,
  position: { x: -4, y: 1.5, z: 0 },
  title: 'Mon Œuvre',
  artist: 'Artiste',
  imageUrl: 'path/to/image.jpg'
});

// Ajouter un éclairage d'exposition
editor.addExhibitionLighting({
  position: { x: 0, y: 2.5, z: 2 },
  target: { x: -4, y: 1.5, z: 0 }
});
```

### Système d'Interactions

```javascript
// Rendre un objet interactif
editor.makeObjectInteractive(objectId, {
  onClick: (object, event) => {
    console.log('Objet cliqué!');
  },
  onHover: (object) => {
    console.log('Survol commencé');
  },
  hoverColor: 0x00ff00
});

// Créer un bouton 3D
editor.create3DButton('Cliquez-moi!', 
  { x: 2, y: 1, z: 2 },
  {
    onClick: () => alert('Bouton cliqué!')
  }
);

// Créer une zone d'interaction
editor.createInteractionZone(
  { x: 0, y: 0.5, z: -2 },  // position
  { x: 2, y: 1, z: 2 },     // taille
  {
    onClick: () => console.log('Zone activée!')
  }
);
```

## 🎯 Événements

```javascript
// Écouter les événements
editor.on('objectAdded', (data) => {
  console.log('Objet ajouté:', data.id);
});

editor.on('objectSelected', (data) => {
  console.log('Objet sélectionné:', data.id);
});

editor.on('objectClicked', (data) => {
  console.log('Objet cliqué:', data.object);
});

editor.on('avatarCreated', (data) => {
  console.log('Avatar créé:', data.id);
});
```

## 💾 Export/Import

```javascript
// Exporter la scène
const sceneData = editor.exportScene();
const blob = new Blob([sceneData], { type: 'application/json' });

// Importer une scène
editor.importScene(sceneData);

// Exporter une exposition
const exhibitionData = editor.exportExhibition();
```

## 🎮 Contrôles

### Raccourcis Clavier (style Unity)
- **W** : Mode déplacement
- **E** : Mode rotation  
- **R** : Mode échelle
- **Delete/Backspace** : Supprimer l'objet sélectionné

### Contrôles Souris
- **Clic gauche** : Sélectionner un objet
- **Clic droit** : Menu contextuel (si configuré)
- **Double-clic** : Action personnalisée
- **Molette** : Zoom
- **Glisser** : Rotation de la caméra

## 🔧 Configuration

```javascript
const editor = new Editor3D(container, {
  enableShadows: true,        // Activer les ombres
  enableGrid: true,           // Afficher la grille
  backgroundColor: 0x1a1a1a,  // Couleur de fond
  // ... autres options
});
```

## 📊 Statistiques

```javascript
const stats = editor.getStats();
console.log(stats);
// {
//   objects: 5,
//   avatars: 2,
//   exhibitions: 1,
//   artworks: 3
// }
```

## 🧹 Nettoyage

```javascript
// Nettoyer complètement l'éditeur
editor.dispose();
```

## 🌟 Avantages

✅ **Framework-agnostic** : Fonctionne avec React, Vue, Angular, vanilla JS  
✅ **Modulaire** : Utilisez seulement les modules dont vous avez besoin  
✅ **Workflow Unity** : Contrôles familiers et intuitifs  
✅ **Avatars immersifs** : Système d'avatars inspiré de Spatial.io  
✅ **Expositions virtuelles** : Créez des galeries comme VExhibition  
✅ **Interactions riches** : Système d'événements complet  
✅ **Export/Import** : Sauvegardez et chargez vos créations  
✅ **Performance** : Basé sur Three.js optimisé  

## 🚀 Exemples Complets

Consultez le dossier `examples/` pour des implémentations complètes :
- `vanilla-js/` : Exemple JavaScript pur
- `react-integration/` : Intégration React
- `vue-integration/` : Intégration Vue.js

## 📝 Licence

MIT License - Utilisez librement dans vos projets !