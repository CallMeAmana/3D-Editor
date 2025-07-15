import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Upload, Play, Settings } from "lucide-react";
import { EditorHeaderLogic } from '../modules/EditorHeader';

interface EditorHeaderWrapperProps {
  onSave: (blob: Blob) => void;
  onLoad: (sceneName: string, objects: any[]) => void;
  onPreview: (message: string) => void;
  sceneName: string;
}

export const EditorHeaderWrapper: React.FC<EditorHeaderWrapperProps> = ({
  onSave,
  onLoad,
  onPreview,
  sceneName
}) => {
  const handleSave = () => {
    // The parent should provide the objects to save
    // This wrapper expects the parent to pass the correct callback
    // For demo, we'll call onSave with an empty array
    onSave(EditorHeaderLogic.saveScene(sceneName, []));
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      EditorHeaderLogic.loadScene(
        file,
        (name, objects) => onLoad(name, objects),
        (error) => alert('Erreur de chargement de la scène')
      );
    };
    input.click();
  };

  const handlePreview = () => {
    onPreview(EditorHeaderLogic.previewScene());
  };

  return (
    <header className="h-16 bg-editor-panel border-b border-editor-panel-border flex items-center justify-between px-6 shadow-panel">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
          3D Editor
        </h1>
        <Badge variant="outline" className="border-editor-active text-editor-active">
          {sceneName || "Nouvelle Scène"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoad}
          className="border-editor-panel-border hover:bg-editor-hover"
        >
          <Upload className="w-4 h-4 mr-2" />
          Charger
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="border-editor-panel-border hover:bg-editor-hover"
        >
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handlePreview}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Play className="w-4 h-4 mr-2" />
          Aperçu
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-editor-hover"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}; 