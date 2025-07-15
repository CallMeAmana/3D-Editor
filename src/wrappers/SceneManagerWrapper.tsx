import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { SceneManager, Object3DData } from '../core/SceneManager';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// @ts-ignore
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

// Remove onImport3DObject from props
type SceneManagerWrapperHandle = {
  import3DObject: (file: File, customId: string, onImported: (scene: any) => void) => void;
};

interface SceneManagerWrapperProps {
  objects: Object3DData[];
  selectedObject: Object3DData | null;
  onObjectSelect: (object: Object3DData | null) => void;
  onObjectUpdate: (id: string, updates: Partial<Object3DData>) => void;
  selectedTool?: string;
  importedObjects?: { id: string, scene: any }[];
  onDeleteImportedObject?: (id: string) => void;
}

export const SceneManagerWrapper = forwardRef<SceneManagerWrapperHandle, SceneManagerWrapperProps>(
  ({
    objects,
    selectedObject,
    onObjectSelect,
    onObjectUpdate,
    selectedTool,
    importedObjects,
    onDeleteImportedObject
  }, ref) => {
    const managerRef = useRef<SceneManager | null>(null);
    const meshRefs = useRef<{ [id: string]: THREE.Mesh }>({});
    const transformControlsRef = useRef<any>(null);
    const [isTransforming, setIsTransforming] = React.useState(false);
    const [localTransform, setLocalTransform] = React.useState<{ position: any; rotation: any; scale: any } | null>(null);

    // Sync objects with SceneManager
    useEffect(() => {
      if (!managerRef.current) managerRef.current = new SceneManager();
      managerRef.current.clear();
      objects.forEach(obj => managerRef.current!.addObject(obj));
      if (selectedObject) managerRef.current.selectObject(selectedObject.id);
      else managerRef.current.selectObject(null);
    }, [objects, selectedObject]);

    // Helper to update local transform during drag
    const handleTransformChange = () => {
      if (!selectedObject) return;
      const mesh = meshRefs.current[selectedObject.id];
      if (!mesh) return;
      let position = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
      let rotation = { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z };
      let scale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };
      if (selectedTool === 'scale') {
        const uniform = mesh.scale.x;
        scale = { x: uniform, y: uniform, z: uniform };
        mesh.scale.set(uniform, uniform, uniform);
      }
      setLocalTransform({ position, rotation, scale });
    };

    // Commit transform to state on mouse up
    const handleTransformCommit = () => {
      setIsTransforming(false);
      if (!selectedObject) {
        setLocalTransform(null);
        return;
      }
      const mesh = meshRefs.current[selectedObject.id];
      if (!mesh) {
        setLocalTransform(null);
        return;
      }
      let position = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
      let rotation = { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z };
      let scale = { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z };
      if (selectedTool === 'scale') {
        const uniform = mesh.scale.x;
        scale = { x: uniform, y: uniform, z: uniform };
      }
      onObjectUpdate(selectedObject.id, { position, rotation, scale });
      setLocalTransform(null);
    };

    // Expose import3DObject to parent
    useImperativeHandle(ref, () => ({
      import3DObject: (file: File, customId: string, onImported: (scene: any) => void) => {
        if (!managerRef.current) return;
        const scene = managerRef.current.scene;
        const ext = file.name.split('.').pop()?.toLowerCase();
        const url = URL.createObjectURL(file);

        let loader: any;
        if (ext === 'glb' || ext === 'gltf') {
          loader = new GLTFLoader();
          loader.load(url, (gltf) => {
            gltf.scene.userData = { id: customId, type: 'imported' };
            scene.add(gltf.scene);
            if (onImported) onImported(gltf.scene);
            URL.revokeObjectURL(url);
          }, undefined, (err) => {
            alert('Erreur lors de l\'import GLTF : ' + err.message);
            URL.revokeObjectURL(url);
          });
        } else if (ext === 'obj') {
          loader = new OBJLoader();
          loader.load(url, (obj) => {
            obj.userData = { id: customId, type: 'imported' };
            scene.add(obj);
            if (onImported) onImported(obj);
            URL.revokeObjectURL(url);
          }, undefined, (err) => {
            alert('Erreur lors de l\'import OBJ : ' + err.message);
            URL.revokeObjectURL(url);
          });
        } else if (ext === 'fbx') {
          loader = new FBXLoader();
          loader.load(url, (fbx) => {
            fbx.userData = { id: customId, type: 'imported' };
            scene.add(fbx);
            if (onImported) onImported(fbx);
            URL.revokeObjectURL(url);
          }, undefined, (err) => {
            alert('Erreur lors de l\'import FBX : ' + err.message);
            URL.revokeObjectURL(url);
          });
        } else {
          alert('Format non supporté : ' + ext);
          URL.revokeObjectURL(url);
        }
      }
    }), []);

    return (
      <div className="flex-1 bg-editor-canvas-bg relative">
        {/* Import 3D Object Button supprimé */}
        <Canvas
          camera={{ position: [5, 5, 5], fov: 60 }}
          shadows
        >
          {/* Affiche les objets importés */}
          {importedObjects && importedObjects.map(obj => (
            <primitive
              key={obj.id}
              object={obj.scene}
              onPointerDown={e => {
                e.stopPropagation();
                onObjectSelect({
                  id: obj.id,
                  type: 'imported',
                  position: obj.scene.position,
                  rotation: obj.scene.rotation,
                  scale: obj.scene.scale,
                  material: { color: '#4F46E5' }
                });
              }}
            />
          ))}
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />

          {/* Environment */}
          <Environment preset="studio" />
          {/* Grid */}
          <Grid 
            args={[20, 20]} 
            cellSize={1} 
            cellThickness={0.5} 
            cellColor="#444444" 
            sectionSize={5} 
            sectionThickness={1} 
            sectionColor="#666666" 
            fadeDistance={25} 
            fadeStrength={1} 
            followCamera={false} 
            infiniteGrid 
          />
          {/* Objects */}
          {objects.map((object) => {
            if (object.type === 'imported') {
              // Ne rien rendre ici, l'objet GLB/OBJ/FBX est déjà dans la scène Three.js
              return null;
            }
            const isSelected = selectedObject?.id === object.id;
            const pos = isSelected && localTransform?.position ? localTransform.position : object.position;
            const rot = isSelected && localTransform?.rotation ? localTransform.rotation : object.rotation;
            const scl = isSelected && localTransform?.scale ? localTransform.scale : object.scale;
            let geometry = null;
            if (object.type === 'sphere') geometry = <sphereGeometry args={[1, 32, 32]} />;
            else if (object.type === 'cylinder') geometry = <cylinderGeometry args={[1, 1, 2, 32]} />;
            else geometry = <boxGeometry args={[1, 1, 1]} />;
            return (
              <mesh
                key={object.id}
                ref={ref => { if (ref) meshRefs.current[object.id] = ref; }}
                position={[pos.x, pos.y, pos.z]}
                rotation={[rot.x, rot.y, rot.z]}
                scale={[scl.x, scl.y, scl.z]}
                onPointerDown={e => {
                  e.stopPropagation();
                  onObjectSelect(object);
                }}
              >
                {geometry}
                <meshStandardMaterial 
                  color={object.material.color} 
                  wireframe={isSelected}
                  transparent={isSelected}
                  opacity={isSelected ? 0.8 : 1}
                />
                {isSelected && (
                  <lineSegments>
                    <edgesGeometry args={[meshRefs.current[object.id]?.geometry]} />
                    <lineBasicMaterial color="#00ff88" linewidth={2} />
                  </lineSegments>
                )}
              </mesh>
            );
          })}
          {/* Transform Controls */}
          {selectedObject && selectedTool !== 'select' && (
            <TransformControls
              ref={transformControlsRef}
              object={
                selectedObject.type === 'imported'
                  ? importedObjects?.find(obj => obj.id === selectedObject.id)?.scene
                  : meshRefs.current[selectedObject.id]
              }
              mode={selectedTool === 'move' ? 'translate' : 'rotate'}
              onMouseDown={() => setIsTransforming(true)}
              onMouseUp={handleTransformCommit}
              onObjectChange={handleTransformChange}
            />
          )}
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={50}
            enabled={!isTransforming}
          />
        </Canvas>
        {/* Scene Info (keep only object count) */}
        <div className="absolute top-20 left-4 bg-editor-panel/90 backdrop-blur-sm rounded-lg p-3 border border-editor-panel-border">
          <div className="text-sm space-y-1">
            <div className="text-muted-foreground">Objets: {objects.length}</div>
          </div>
        </div>
      </div>
    );
  }
); 