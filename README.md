# 3D Editor - Bibliothèque JavaScript Pure et Modulaire

Une bibliothèque 3D **100% JavaScript pur** et **framework-agnostic** qui combine :
- **Workflow fluide de Unity** pour les transformations d'objets
- **Templates immersifs et avatars de Spatial.io** 
- **Fonctionnalités d'exposition de VExhibition**

## 🎯 Objectif Principal

Créer une bibliothèque JavaScript **pure, modulaire et indépendante** qui peut être intégrée facilement dans n'importe quelle technologie (React, Vue, Angular, vanilla JS, etc.).

## 🏗️ Architecture Modulaire

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

index.html                  # Démonstration principale
```

## 🚀 Utilisation Immédiate

### JavaScript Pur (Vanilla)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mon Éditeur 3D</title>
</head>
<body>
    <div id="canvas-container" style="width: 100%; height: 500px;"></div>
    
    <script type="module">
        import Editor3D from './lib/3DEditor.js';
        
        // Initialiser l'éditeur
        const container = document.getElementById('canvas-container');
        const editor = new Editor3D(container);
        
        // Ajouter des objets (Unity-style)
        const cubeId = editor.addCube({
            position: { x: 0, y: 0.5, z: 0 },
            color: 0x4F46E5
        });
        
        // Rendre interactif
        editor.makeObjectInteractive(cubeId, {
            onClick: (object) => {
                console.log('Cube cliqué!');
                editor.selectObject(object.userData.id);
            }
        });
        
        // Créer un avatar (Spatial.io-style)
        editor.createAvatar({
            position: { x: 2, y: 0, z: 0 },
            bodyColor: 0x4A90E2
        });
        
        // Créer une salle d'exposition (VExhibition-style)
        editor.createExhibitionRoom({
            width: 10,
            height: 3,
            depth: 10,
            wallColor: 0xffffff
        });
        
        // Ajouter une œuvre d'art
        editor.addArtwork({
            width: 1.5,
            height: 1,
            position: { x: -4, y: 1.5, z: 0 },
            title: 'Mon Œuvre',
            artist: 'Artiste',
            color: 0xff6b6b
        });
    </script>
</body>
</html>
```

## 🎮 API Complète

### Gestion des Objets 3D (Unity-style)

```javascript
// Ajouter des primitives
const cubeId = editor.addCube(options);
const sphereId = editor.addSphere(options);
const cylinderId = editor.addCylinder(options);

// Manipuler les objets
editor.selectObject(id);
editor.updateObject(id, { 
    position: { x: 1, y: 0, z: 0 },
    rotation: { x: 0, y: Math.PI/4, z: 0 },
    scale: { x: 1.5, y: 1.5, z: 1.5 }
});
editor.removeObject(id);

// Modes de transformation Unity
editor.setTransformMode('translate'); // W
editor.setTransformMode('rotate');    // E
editor.setTransformMode('scale');     // R
```

### Système d'Avatars (Spatial.io-style)

```javascript
// Créer un avatar simple
const avatarId = editor.createAvatar({
    position: { x: 0, y: 0, z: 0 },
    bodyColor: 0x4A90E2,
    skinColor: 0xFFDBB3
});

// Charger un avatar 3D depuis un fichier GLB/GLTF
editor.loadAvatarFromFile(file, {
    position: { x: 0, y: 0, z: 0 },
    height: 1.8
}).then(avatarId => {
    console.log('Avatar chargé:', avatarId);
});

// Déplacer un avatar avec animation
editor.moveAvatar(avatarId, { x: 5, y: 0, z: 5 }, 2000);

// Faire regarder un avatar vers une direction
editor.avatars.lookAt(avatarId, { x: 0, y: 0, z: 0 });
```

### Système d'Exposition (VExhibition-style)

```javascript
// Créer une salle d'exposition
const roomId = editor.createExhibitionRoom({
    width: 10,
    height: 3,
    depth: 8,
    wallColor: 0xffffff,
    floorColor: 0xf0f0f0,
    ceilingColor: 0xfafafa
});

// Ajouter une œuvre d'art avec cadre
const artworkId = editor.addArtwork({
    width: 1.5,
    height: 1,
    position: { x: -4, y: 1.5, z: 0 },
    title: 'Mon Œuvre',
    artist: 'Artiste',
    description: 'Description de l\'œuvre',
    imageUrl: 'path/to/image.jpg', // Optionnel
    frameColor: 0x8B4513
});

// Ajouter un éclairage d'exposition professionnel
editor.addExhibitionLighting({
    position: { x: 0, y: 2.5, z: 2 },
    target: { x: -4, y: 1.5, z: 0 },
    intensity: 1.5,
    color: 0xffffff
});

// Créer un parcours de visite
const points = [
    { x: -3, y: 0.1, z: -3 },
    { x: 0, y: 0.1, z: -3 },
    { x: 3, y: 0.1, z: 0 }
];
editor.exhibitions.createVisitPath(points);
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
    onHoverEnd: (object) => {
        console.log('Survol terminé');
    },
    hoverColor: 0x00ff00
});

// Créer un bouton 3D
editor.create3DButton('Cliquez-moi!', 
    { x: 2, y: 1, z: 2 },
    {
        width: 2,
        height: 0.6,
        onClick: () => alert('Bouton cliqué!')
    }
);

// Créer une zone d'interaction invisible
editor.createInteractionZone(
    { x: 0, y: 0.5, z: -2 },  // position
    { x: 2, y: 1, z: 2 },     // taille
    {
        onClick: () => console.log('Zone activée!'),
        debug: true // Afficher la zone en mode debug
    }
);
```

## 🎯 Système d'Événements

```javascript
// Écouter les événements
editor.on('objectAdded', (data) => {
    console.log('Objet ajouté:', data.id, data.type);
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

editor.on('transformModeChanged', (data) => {
    console.log('Mode changé:', data.mode);
});
```

## 💾 Export/Import

```javascript
// Exporter la scène complète
const sceneData = editor.exportScene();
const blob = new Blob([sceneData], { type: 'application/json' });

// Importer une scène
editor.importScene(sceneData);

// Exporter spécifiquement une exposition
const exhibitionData = editor.exportExhibition();
```

## 🎮 Contrôles (Unity-style)

### Raccourcis Clavier
- **W** : Mode déplacement (translate)
- **E** : Mode rotation  
- **R** : Mode échelle (scale)
- **Delete/Backspace** : Supprimer l'objet sélectionné

### Contrôles Souris
- **Clic gauche** : Sélectionner un objet
- **Clic droit** : Menu contextuel (si configuré)
- **Double-clic** : Action personnalisée
- **Molette** : Zoom caméra
- **Glisser** : Rotation de la caméra (OrbitControls)

## 🔧 Configuration

```javascript
const editor = new Editor3D(container, {
    enableShadows: true,        // Activer les ombres
    enableGrid: true,           // Afficher la grille
    backgroundColor: 0x2a2a2a,  // Couleur de fond
    // ... autres options
});
```

## 📊 Statistiques et Utilitaires

```javascript
// Obtenir les statistiques
const stats = editor.getStats();
console.log(stats);
// {
//   objects: 5,
//   avatars: 2,
//   exhibitions: 1,
//   artworks: 3
// }

// Version de la bibliothèque
console.log(editor.getVersion()); // "1.0.0"
```

## 🧹 Nettoyage

```javascript
// Nettoyer complètement l'éditeur
editor.dispose();
```

## 🌟 Avantages Clés

✅ **100% JavaScript Pur** : Aucune dépendance à un framework  
✅ **Framework-Agnostic** : Fonctionne avec React, Vue, Angular, vanilla JS  
✅ **Modulaire** : Utilisez seulement les modules nécessaires  
✅ **Unity Workflow** : Contrôles familiers et intuitifs (W/E/R)  
✅ **Avatars Immersifs** : Système d'avatars inspiré de Spatial.io  
✅ **Expositions Virtuelles** : Créez des galeries comme VExhibition  
✅ **Interactions Riches** : Système d'événements complet  
✅ **Export/Import** : Sauvegardez et chargez vos créations  
✅ **Performance** : Basé sur Three.js optimisé  
✅ **Extensible** : Architecture modulaire pour ajouts futurs  

## 🚀 Démarrage Rapide

1. **Cloner le projet**
2. **Ouvrir `index.html`** dans un navigateur moderne
3. **Tester l'éditeur** avec l'interface complète
4. **Consulter les exemples** dans le dossier `examples/`

## 📝 Intégrations Disponibles

- **Vanilla JavaScript** : `examples/vanilla-js/`
- **React** : `examples/react-integration/`
- **Vue.js** : `examples/vue-integration/`

## 📄 Licence

MIT License - Utilisez librement dans vos projets étudiants et professionnels !

---

**Cette bibliothèque est 100% JavaScript pur et peut être intégrée dans n'importe quel projet sans dépendance à un framework spécifique.**