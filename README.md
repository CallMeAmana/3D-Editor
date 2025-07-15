#3D Editor 

## Vision
Un métamodèle 3D modulaire, réutilisable et intégrable dans n'importe quelle plateforme ou framework. Basé sur Three.js, il permet de construire, explorer et enrichir des scènes 3D avec avatars, objets interactifs, etc.

## Architecture

- `src/core/` : cœur du moteur (pure JS/TS, aucune dépendance React)
  - `SceneManager.ts` : gestion de la scène, objets, navigation...
- `src/modules/` : modules fonctionnels (logique pure JS/TS, sauf UI)
  - `PropertiesPanel.ts`, `EditorHeader.ts`, `AvatarSystem.ts`, `InteractionSystem.ts`, `Networking.ts`, `PluginSystem.ts`, `UIComponents.ts` (logique)
  - `EditorToolbar.tsx` (UI React)
- `src/wrappers/` : wrappers React pour intégrer les modules JS/TS dans une UI moderne
  - `SceneManagerWrapper.tsx`, `PropertiesPanelWrapper.tsx`, `EditorHeaderWrapper.tsx`
- `src/components/ui/` : primitives UI réutilisables (React)
- `src/hooks/`, `src/lib/` : hooks et utilitaires

## Pourquoi cette architecture ?
-**Séparation stricte** entre logique (JS/TS pur) et interface (React)
- **Réutilisabilité** : le cœur peut être utilisé dans d'autres frameworks ou en vanilla JS
- **Testabilité** : logique testable sans UI
- **Interopérabilité** : facile d'ajouter d'autres wrappers (Svelte, Angular, etc.)

## Modules actuels
- [x] SceneManager (core, JS/TS pur)
- [x] PropertiesPanel (modules, JS/TS pur)
- [x] EditorHeader (modules, JS/TS pur)
- [x] EditorToolbar (modules, React UI)
- [x] Wrappers React (wrappers/)
- [ ] AvatarSystem:Module for managing avatars in the 3D scene, InteractionSystem:Module for managing interactions in the 3D scene, Networking:Module for networking and multi-user support, PluginSystem:Module for plugin/extensibility support, UIComponents :Module for additional UI components (modules)

## API publique (exemples)

### Utilisation JS/TS pur
```js
import { SceneManager } from './core/SceneManager';
const scene = new SceneManager();
scene.addObject({ type: 'box', ... });
scene.selectObject('object_id');
```

### Utilisation avec React
```jsx
import { SceneManagerWrapper } from './wrappers/SceneManagerWrapper';
<SceneManagerWrapper
  objects={objects}
  selectedObject={selectedObject}
  onObjectSelect={setSelectedObject}
  onObjectUpdate={handleObjectUpdate}
  selectedTool={selectedTool}
/>
```

## Intégration
- Vanilla JS/TS (core)
- React (wrappers)

## Primitives UI disponibles
- badge, button, card, input, label, separator, sheet, slider, toast, toaster, tooltip (dans `src/components/ui/`)

## Contribuer
- Forkez le repo, proposez des modules (JS/TS pur), ou des wrappers (React, Svelte, etc.)
- Respectez la séparation logique/UI
- Améliorez la doc !

## Migration 
- Toute la logique métier a été extraite en modules JS/TS purs
- Les composants React ne servent que de wrappers ou d'UI
- Plus facile à maintenir, tester, et intégrer ailleurs
