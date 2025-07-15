// PropertiesPanel.ts
import { Object3DData } from "@/core/SceneManager";

export class PropertiesPanelLogic {
  private object: Object3DData | null;

  constructor(object: Object3DData | null) {
    this.object = object;
  }

  setObject(object: Object3DData | null) {
    this.object = object;
  }

  getObject() {
    return this.object;
  }

  updatePosition(axis: 'x' | 'y' | 'z', value: number): Object3DData | null {
    if (!this.object) return null;
    const position = { ...this.object.position, [axis]: value };
    this.object = { ...this.object, position };
    return this.object;
  }

  updateRotation(axis: 'x' | 'y' | 'z', value: number): Object3DData | null {
    if (!this.object) return null;
    const rotation = { ...this.object.rotation, [axis]: value };
    this.object = { ...this.object, rotation };
    return this.object;
  }

  updateScale(uniformScale: number): Object3DData | null {
    if (!this.object) return null;
    const scale = { x: uniformScale, y: uniformScale, z: uniformScale };
    this.object = { ...this.object, scale };
    return this.object;
  }

  updateColor(color: string): Object3DData | null {
    if (!this.object) return null;
    const material = { ...this.object.material, color };
    this.object = { ...this.object, material };
    return this.object;
  }
}