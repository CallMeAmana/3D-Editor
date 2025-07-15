import { useState, useCallback, useRef } from 'react';
import { EditorHeaderWrapper } from '@/wrappers/EditorHeaderWrapper';
import { EditorToolbar } from '@/modules/EditorToolbar';
import { SceneManagerWrapper } from '@/wrappers/SceneManagerWrapper';
import { PropertiesPanelWrapper } from '@/wrappers/PropertiesPanelWrapper';
import { useToast } from '@/hooks/use-toast';
import { EditorHeaderLogic } from '@/modules/EditorHeader';
import { Object3DData } from '@/core/SceneManager';

// Étend le type pour inclure 'imported'
interface Object3D {
  id: string;
  type: 'box' | 'sphere' | 'cylinder' | 'imported';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  material: { color: string };
  // Optionnel : pour l'export
  importType?: string;
}

let objectIdCounter = 0;

const Index = () => {
  const { toast } = useToast();
  const [objects, setObjects] = useState<Object3D[]>([]);
  const [selectedObject, setSelectedObject] = useState<Object3D | null>(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [sceneName, setSceneName] = useState('');
  const [importedObjects, setImportedObjects] = useState<{ id: string; scene: any }[]>([]);
  const sceneManagerRef = useRef<any>(null);

  const createObject = useCallback((type: 'box' | 'sphere' | 'cylinder'): Object3D => {
    objectIdCounter++;
    return {
      id: `object_${Date.now()}_${objectIdCounter}`,
      type,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      material: { color: '#4F46E5' }
    };
  }, []);

  const handleAddPrimitive = useCallback((type: 'box' | 'sphere' | 'cylinder') => {
    const newObject = createObject(type);
    setObjects(prev => [...prev, newObject]);
    setSelectedObject(newObject);
    toast({
      title: "Objet ajouté",
      description: `Un ${type === 'box' ? 'cube' : type === 'sphere' ? 'sphère' : 'cylindre'} a été ajouté à la scène.`
    });
  }, [createObject, toast]);

  const handleObjectUpdate = useCallback((id: string, updates: Partial<Object3D>) => {
    setObjects(prev => prev.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));

    // Met à jour l'objet importé dans la scène si besoin
    if (selectedObject?.id === id && selectedObject.type === 'imported' && updates.scale) {
      setImportedObjects(prev => prev.map(obj => {
        if (obj.id === id) {
          obj.scene.scale.set(updates.scale.x, updates.scale.y, updates.scale.z);
        }
        return obj;
      }));
    }

    if (selectedObject?.id === id) {
      setSelectedObject(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedObject]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedObject) return;
    if (selectedObject.type === 'imported') {
      setImportedObjects(prev => prev.filter(obj => obj.id !== selectedObject.id));
      setObjects(prev => prev.filter(obj => obj.id !== selectedObject.id));
      setSelectedObject(null);
      toast({
        title: "Objet supprimé",
        description: "L'objet importé a été supprimé de la scène."
      });
      return;
    }
    setObjects(prev => prev.filter(obj => obj.id !== selectedObject.id));
    setSelectedObject(null);
    toast({
      title: "Objet supprimé",
      description: "L'objet sélectionné a été supprimé de la scène."
    });
  }, [selectedObject, toast]);

  // New: Save callback for EditorHeaderWrapper
  const handleSaveScene = useCallback(() => {
    // Combine primitives et objets importés pour l'export
    const allObjects: Object3DData[] = [
      ...objects,
      ...importedObjects.map(obj => ({
        id: obj.id,
        type: 'imported', // force explicit type
        position: {
          x: obj.scene.position.x,
          y: obj.scene.position.y,
          z: obj.scene.position.z
        },
        rotation: {
          x: obj.scene.rotation.x,
          y: obj.scene.rotation.y,
          z: obj.scene.rotation.z
        },
        scale: {
          x: obj.scene.scale.x,
          y: obj.scene.scale.y,
          z: obj.scene.scale.z
        },
        material: { color: '#4F46E5' },
      } as Object3DData))
    ];
    const blob = EditorHeaderLogic.saveScene(sceneName, allObjects);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sceneName || 'scene'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Scène sauvegardée",
      description: `La scène "${sceneName || 'Nouvelle Scène'}" a été exportée.`
    });
  }, [sceneName, toast, objects, importedObjects]);

  // New: Load callback for EditorHeaderWrapper
  const handleLoadScene = useCallback((name: string, loadedObjects: Object3D[]) => {
    setObjects(loadedObjects);
    setSceneName(name);
    setSelectedObject(null);
    toast({
      title: "Scène chargée",
      description: `La scène "${name}" a été chargée avec succès.`
    });
  }, [toast]);

  // New: Preview callback for EditorHeaderWrapper
  const handlePreview = useCallback((message: string) => {
    toast({
      title: "Mode aperçu",
      description: message
    });
  }, [toast]);

  // Fonction d'import d'objet 3D
  const handleImport3DObject = useCallback((file: File) => {
    if (sceneManagerRef.current && sceneManagerRef.current.import3DObject) {
      objectIdCounter++;
      const id = `imported_${Date.now()}_${objectIdCounter}`;
      setObjects(prev => [
        ...prev,
        {
          id,
          type: 'imported',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          material: { color: '#4F46E5' }
        }
      ]);
      sceneManagerRef.current.import3DObject(file, id, (importedScene) => {
        setImportedObjects(prev => [...prev, { id, scene: importedScene }]);
        toast({
          title: "Objet ajouté",
          description: `Un objet 3D a été importé dans la scène.`
        });
      });
    }
  }, [toast]);

  const handleUpdateSelectedObject = useCallback((updates: Partial<Object3D>) => {
    if (!selectedObject) return;
    handleObjectUpdate(selectedObject.id, updates);
  }, [selectedObject, handleObjectUpdate]);

  const handleDeselectObject = useCallback(() => {
    setSelectedObject(null);
    setSelectedTool('select'); // Reset tool to default
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorHeaderWrapper
        onSave={handleSaveScene}
        onLoad={handleLoadScene}
        onPreview={handlePreview}
        sceneName={sceneName}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <EditorToolbar
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          onAddPrimitive={handleAddPrimitive}
          onDeleteSelected={handleDeleteSelected}
          selectedObject={selectedObject}
          onImport3DObject={handleImport3DObject}
        />
        
        <SceneManagerWrapper
          ref={sceneManagerRef}
          objects={objects}
          selectedObject={selectedObject}
          onObjectSelect={setSelectedObject}
          onObjectUpdate={handleObjectUpdate}
          selectedTool={selectedTool}
          importedObjects={importedObjects}
          onDeleteImportedObject={id => {
            setImportedObjects(prev => prev.filter(obj => obj.id !== id));
            setObjects(prev => prev.filter(obj => obj.id !== id));
            setSelectedObject(null);
          }}
        />
        
        <PropertiesPanelWrapper
          selectedObject={selectedObject}
          onUpdateObject={handleUpdateSelectedObject}
          onDeselectObject={handleDeselectObject}
        />
      </div>
    </div>
  );
};

export default Index;
