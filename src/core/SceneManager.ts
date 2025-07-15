// SceneManager.ts
import * as THREE from 'three';

export interface Object3DData {
  id: string;
  type: 'box' | 'sphere' | 'cylinder' | 'imported';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  material: { color: string };
}

export class SceneManager {
  public scene: THREE.Scene;
  public objects: Map<string, THREE.Mesh>;
  public selectedObjectId: string | null;

  constructor() {
    this.scene = new THREE.Scene();
    this.objects = new Map();
    this.selectedObjectId = null;
  }

  addObject(data: Object3DData): void {
    let geometry: THREE.BufferGeometry;
    switch (data.type) {
      case 'sphere':
        geometry = new THREE.SphereGeometry(1, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    const material = new THREE.MeshStandardMaterial({ color: data.material.color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(data.position.x, data.position.y, data.position.z);
    mesh.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    mesh.scale.set(data.scale.x, data.scale.y, data.scale.z);
    mesh.userData = { id: data.id, type: data.type };
    this.scene.add(mesh);
    this.objects.set(data.id, mesh);
  }

  removeObject(id: string): void {
    const mesh = this.objects.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      this.objects.delete(id);
      if (this.selectedObjectId === id) this.selectedObjectId = null;
    }
  }

  selectObject(id: string | null): void {
    this.selectedObjectId = id;
  }

  updateObject(id: string, updates: Partial<Object3DData>): void {
    const mesh = this.objects.get(id);
    if (!mesh) return;
    if (updates.position) {
      mesh.position.set(updates.position.x, updates.position.y, updates.position.z);
    }
    if (updates.rotation) {
      mesh.rotation.set(updates.rotation.x, updates.rotation.y, updates.rotation.z);
    }
    if (updates.scale) {
      mesh.scale.set(updates.scale.x, updates.scale.y, updates.scale.z);
    }
    if (updates.material && (mesh.material as THREE.MeshStandardMaterial)) {
      (mesh.material as THREE.MeshStandardMaterial).color.set(updates.material.color);
    }
  }

  getSelectedObjectData(): Object3DData | null {
    if (!this.selectedObjectId) return null;
    const mesh = this.objects.get(this.selectedObjectId);
    if (!mesh) return null;
    return {
      id: mesh.userData.id,
      type: mesh.userData.type,
      position: { ...mesh.position },
      rotation: { ...mesh.rotation },
      scale: { ...mesh.scale },
      material: { color: (mesh.material as THREE.MeshStandardMaterial).color.getStyle() },
    };
  }

  getAllObjectData(): Object3DData[] {
    return Array.from(this.objects.values()).map(mesh => ({
      id: mesh.userData.id,
      type: mesh.userData.type,
      position: { ...mesh.position },
      rotation: { ...mesh.rotation },
      scale: { ...mesh.scale },
      material: { color: (mesh.material as THREE.MeshStandardMaterial).color.getStyle() },
    }));
  }

  clear(): void {
    this.objects.forEach(mesh => this.scene.remove(mesh));
    this.objects.clear();
    this.selectedObjectId = null;
  }
}