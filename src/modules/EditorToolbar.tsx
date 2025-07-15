import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  MousePointer, 
  Move3D, 
  RotateCcw, 
  Maximize, 
  Box, 
  Circle, 
  Cylinder,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

interface EditorToolbarProps {
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  onAddPrimitive: (type: 'box' | 'sphere' | 'cylinder') => void;
  onDeleteSelected: () => void;
  selectedObject: any;
  onImport3DObject: (file: File) => void; // rendre requis
}

export const EditorToolbar = ({ 
  selectedTool, 
  onToolSelect, 
  onAddPrimitive, 
  onDeleteSelected,
  selectedObject,
  onImport3DObject // Ajout du callback d'import
}: EditorToolbarProps) => {
  const tools = [
    { id: 'move', icon: Move3D, label: 'Déplacer' },
    { id: 'rotate', icon: RotateCcw, label: 'Rotation' },
  ];

  const primitives = [
    { type: 'box' as const, icon: Box, label: 'Cube' },
    { type: 'sphere' as const, icon: Circle, label: 'Sphère' },
    { type: 'cylinder' as const, icon: Cylinder, label: 'Cylindre' },
  ];

  return (
    <div className="w-20 bg-editor-panel border-r border-editor-panel-border flex flex-col shadow-panel">
      {/* Tools Section */}
      <div className="p-4 space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground mb-3">Outils</h3>
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? "default" : "ghost"}
            size="icon"
            onClick={() => onToolSelect(tool.id)}
            className={`w-full h-10 flex items-center justify-center rounded-md transition-colors ${
              selectedTool === tool.id 
                ? "bg-editor-active text-accent-foreground" 
                : "hover:bg-editor-hover"
            }`}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
          </Button>
        ))}
      </div>

      <Separator className="bg-editor-panel-border" />

      {/* Primitives Section */}
      <div className="p-4 space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground mb-3">Objets</h3>
        {primitives.map((primitive) => (
          <Button
            key={primitive.type}
            variant={selectedObject?.type === primitive.type ? "default" : "ghost"}
            size="icon"
            onClick={() => onAddPrimitive(primitive.type)}
            className={`w-full h-10 flex items-center justify-center rounded-md transition-colors ${
              selectedObject?.type === primitive.type
                ? "bg-editor-active text-accent-foreground"
                : "hover:bg-editor-hover"
            }`}
            title={primitive.label}
          >
            <primitive.icon className="w-5 h-5" />
          </Button>
        ))}
        {/* Bouton Importer un objet 3D (même style que les autres) */}
        <Button
          variant={selectedObject?.type === 'imported' ? "default" : "ghost"}
          size="icon"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.glb,.gltf,.obj,.fbx';
            input.multiple = false;
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file && onImport3DObject) {
                onImport3DObject(file);
              }
            };
            input.click();
          }}
          className={`w-full h-10 flex items-center justify-center rounded-md transition-colors ${
            selectedObject?.type === 'imported'
              ? "bg-editor-active text-accent-foreground"
              : "hover:bg-editor-hover"
          }`}
          title="Importer un objet 3D"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <Separator className="bg-editor-panel-border" />

      {/* Object Actions */}
      <div className="p-4 space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground mb-3">Actions</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDeleteSelected}
          disabled={!selectedObject}
          className="w-full h-10 flex items-center justify-center rounded-md hover:bg-destructive/20 hover:text-destructive disabled:opacity-50 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Retirer le badge 'Sélectionné' */}
      {/* {selectedObject && (
        <div className="mt-auto p-4 border-t border-editor-panel-border">
          <Badge variant="outline" className="text-xs">
            Sélectionné
          </Badge>
        </div>
      )} */}
    </div>
  );
};