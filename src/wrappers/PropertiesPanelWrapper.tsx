import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { PropertiesPanelLogic } from '../modules/PropertiesPanel';
import { Object3DData } from '@/core/SceneManager';

interface PropertiesPanelWrapperProps {
  selectedObject: Object3DData | null;
  onUpdateObject: (updates: Partial<Object3DData>) => void;
  onDeselectObject: () => void;
}

export const PropertiesPanelWrapper: React.FC<PropertiesPanelWrapperProps> = ({
  selectedObject,
  onUpdateObject,
  onDeselectObject
}) => {
  const logic = React.useMemo(() => new PropertiesPanelLogic(selectedObject), [selectedObject]);

  if (!selectedObject) {
    return (
      <div className="w-80 bg-editor-panel border-l border-editor-panel-border p-6 shadow-panel">
        <div className="text-center text-muted-foreground mt-20">
          <p>Sélectionnez un objet pour modifier ses propriétés</p>
        </div>
      </div>
    );
  }

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const updated = logic.updatePosition(axis, parseFloat(value) || 0);
    if (updated) onUpdateObject({ position: updated.position });
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: string) => {
    const radians = parseFloat(value) * Math.PI / 180;
    const updated = logic.updateRotation(axis, radians);
    if (updated) onUpdateObject({ rotation: updated.rotation });
  };

  const handleScaleChange = (value: number[]) => {
    const updated = logic.updateScale(value[0]);
    if (updated) onUpdateObject({ scale: updated.scale });
  };

  const handleColorChange = (color: string) => {
    const updated = logic.updateColor(color);
    if (updated) onUpdateObject({ material: updated.material });
  };

  return (
    <div className="w-80 bg-editor-panel border-l border-editor-panel-border shadow-panel">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Propriétés</h3>
            <Badge variant="outline" className="mt-1">
              {selectedObject.type || 'Objet'}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectObject}
            className="hover:bg-editor-hover"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Position */}
          <Card className="p-4 bg-card/50">
            <Label className="text-sm font-medium mb-3 block">Position</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="pos-x" className="text-xs text-muted-foreground">X</Label>
                <Input
                  id="pos-x"
                  type="number"
                  step="0.1"
                  value={selectedObject.position?.x || 0}
                  onChange={(e) => handlePositionChange('x', e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="pos-y" className="text-xs text-muted-foreground">Y</Label>
                <Input
                  id="pos-y"
                  type="number"
                  step="0.1"
                  value={selectedObject.position?.y || 0}
                  onChange={(e) => handlePositionChange('y', e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="pos-z" className="text-xs text-muted-foreground">Z</Label>
                <Input
                  id="pos-z"
                  type="number"
                  step="0.1"
                  value={selectedObject.position?.z || 0}
                  onChange={(e) => handlePositionChange('z', e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </Card>

          {/* Rotation */}
          <Card className="p-4 bg-card/50">
            <Label className="text-sm font-medium mb-3 block">Rotation</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="rot-x" className="text-xs text-muted-foreground">X</Label>
                <Input
                  id="rot-x"
                  type="number"
                  step="0.1"
                  value={((selectedObject.rotation?.x || 0) * 180 / Math.PI).toFixed(1)}
                  onChange={(e) => handleRotationChange('x', e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="rot-y" className="text-xs text-muted-foreground">Y</Label>
                <Input
                  id="rot-y"
                  type="number"
                  step="0.1"
                  value={((selectedObject.rotation?.y || 0) * 180 / Math.PI).toFixed(1)}
                  onChange={(e) => handleRotationChange('y', e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="rot-z" className="text-xs text-muted-foreground">Z</Label>
                <Input
                  id="rot-z"
                  type="number"
                  step="0.1"
                  value={((selectedObject.rotation?.z || 0) * 180 / Math.PI).toFixed(1)}
                  onChange={(e) => handleRotationChange('z', e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
          </Card>

          {/* Scale */}
          <Card className="p-4 bg-card/50">
            <Label className="text-sm font-medium mb-3 block">Échelle</Label>
            <Slider
              value={[selectedObject.scale?.x || 1]}
              onValueChange={handleScaleChange}
              max={5}
              min={0.1}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground mt-2 text-center">
              {(selectedObject.scale?.x || 1).toFixed(1)}x
            </div>
          </Card>

          {/* Material */}
          <Card className="p-4 bg-card/50">
            <Label className="text-sm font-medium mb-3 block">Matériau</Label>
            <div>
              <Label htmlFor="color" className="text-xs text-muted-foreground">Couleur</Label>
              <Input
                id="color"
                type="color"
                value={selectedObject.material?.color || '#4F46E5'}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-8 w-full"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 