/**
 * Exemple d'intégration React avec la bibliothèque JavaScript pure
 */
import React, { useEffect, useRef, useState } from 'react';
import Editor3D from '../../lib/3DEditor.js';

const React3DEditor = () => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [stats, setStats] = useState({ objects: 0, avatars: 0 });
  const [selectedObject, setSelectedObject] = useState(null);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      // Initialiser l'éditeur 3D
      editorRef.current = new Editor3D(containerRef.current, {
        enableShadows: true,
        enableGrid: true,
        backgroundColor: 0x1a1a1a
      });

      // Écouter les événements
      editorRef.current.on('objectAdded', updateStats);
      editorRef.current.on('objectRemoved', updateStats);
      editorRef.current.on('objectSelected', (data) => {
        setSelectedObject(data.id);
      });
      editorRef.current.on('objectDeselected', () => {
        setSelectedObject(null);
      });

      updateStats();
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  const updateStats = () => {
    if (editorRef.current) {
      setStats(editorRef.current.getStats());
    }
  };

  const addCube = () => {
    if (editorRef.current) {
      const id = editorRef.current.addCube({
        position: { x: Math.random() * 4 - 2, y: 0.5, z: Math.random() * 4 - 2 },
        color: Math.random() * 0xffffff
      });
      
      editorRef.current.makeObjectInteractive(id, {
        onClick: (object) => {
          editorRef.current.selectObject(object.userData.id);
        }
      });
    }
  };

  const addSphere = () => {
    if (editorRef.current) {
      const id = editorRef.current.addSphere({
        position: { x: Math.random() * 4 - 2, y: 0.5, z: Math.random() * 4 - 2 },
        color: Math.random() * 0xffffff
      });
      
      editorRef.current.makeObjectInteractive(id, {
        onClick: (object) => {
          editorRef.current.selectObject(object.userData.id);
        }
      });
    }
  };

  const createAvatar = () => {
    if (editorRef.current) {
      editorRef.current.createAvatar({
        position: { x: Math.random() * 4 - 2, y: 0, z: Math.random() * 4 - 2 },
        bodyColor: Math.random() * 0xffffff
      });
    }
  };

  const createExhibitionRoom = () => {
    if (editorRef.current) {
      editorRef.current.createExhibitionRoom({
        width: 8,
        height: 3,
        depth: 8,
        wallColor: 0xf0f0f0,
        floorColor: 0xe0e0e0
      });
    }
  };

  const exportScene = () => {
    if (editorRef.current) {
      const sceneData = editorRef.current.exportScene();
      const blob = new Blob([sceneData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'react-scene.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Container pour le canvas 3D */}
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Interface utilisateur React */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        minWidth: '250px'
      }}>
        <h2>3D Editor - Intégration React</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <h3>Objets 3D</h3>
          <button onClick={addCube} style={buttonStyle}>
            Ajouter Cube
          </button>
          <button onClick={addSphere} style={buttonStyle}>
            Ajouter Sphère
          </button>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <h3>Avatars</h3>
          <button onClick={createAvatar} style={buttonStyle}>
            Créer Avatar
          </button>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <h3>Exposition</h3>
          <button onClick={createExhibitionRoom} style={buttonStyle}>
            Créer Salle
          </button>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <h3>Scène</h3>
          <button onClick={exportScene} style={buttonStyle}>
            Exporter
          </button>
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '14px' }}>
          <div>Objets: {stats.objects}</div>
          <div>Avatars: {stats.avatars}</div>
          {selectedObject && (
            <div style={{ color: '#4A90E2' }}>
              Sélectionné: {selectedObject}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const buttonStyle = {
  background: '#4A90E2',
  color: 'white',
  border: 'none',
  padding: '8px 15px',
  margin: '5px',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default React3DEditor;