// EditorHeader.ts
import { Object3DData } from "@/core/SceneManager";

export class EditorHeaderLogic {
  static saveScene(sceneName: string, objects: Object3DData[]): Blob {
    const sceneData = {
      name: sceneName || 'Nouvelle Scène',
      objects,
      timestamp: new Date().toISOString()
    };
    return new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
  }

  static loadScene(file: File, callback: (sceneName: string, objects: Object3DData[]) => void, errorCallback: (error: any) => void) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const sceneData = JSON.parse(e.target?.result as string);
        const loadedObjects = (sceneData.objects || []).map((obj: Object3DData) => ({
          ...obj,
          id: `object_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
        callback(sceneData.name || '', loadedObjects);
      } catch (error) {
        errorCallback(error);
      }
    };
    reader.readAsText(file);
  }

  static previewScene() {
    // Placeholder for preview logic
    return 'Preview feature coming soon!';
  }
}