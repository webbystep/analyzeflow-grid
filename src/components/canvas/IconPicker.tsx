import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';
import { Search, Upload, X } from 'lucide-react';

interface IconPickerProps {
  currentIcon?: string;
  currentColor?: string;
  customSvg?: string;
  onIconSelect: (iconName: string) => void;
  onColorChange: (color: string) => void;
  onCustomSvgChange: (svg: string | null) => void;
}

// Get list of all Lucide icon names
const LUCIDE_ICON_NAMES = Object.keys(LucideIcons).filter(
  (key) => key !== 'default' && key !== 'createLucideIcon' && typeof (LucideIcons as any)[key] === 'function'
);

export function IconPicker({
  currentIcon = 'Box',
  currentColor = '#000000',
  customSvg,
  onIconSelect,
  onColorChange,
  onCustomSvgChange
}: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [showCustomSvg, setShowCustomSvg] = useState(false);
  const [svgInput, setSvgInput] = useState(customSvg || '');

  const filteredIcons = useMemo(() => {
    return LUCIDE_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 100); // Limit to 100 for performance
  }, [search]);

  const CurrentIconComponent = (LucideIcons as any)[currentIcon] || LucideIcons.Box;

  return (
    <div className="space-y-4">
      {/* Current icon preview */}
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
        <div className="p-3 bg-background rounded-md">
          {customSvg ? (
            <div 
              className="w-8 h-8" 
              dangerouslySetInnerHTML={{ __html: customSvg }}
            />
          ) : (
            <CurrentIconComponent 
              className="w-8 h-8" 
              style={{ color: currentColor }}
            />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {customSvg ? 'Egyedi SVG' : currentIcon}
          </p>
          <p className="text-xs text-muted-foreground">
            {customSvg ? 'Custom SVG feltöltve' : 'Lucide ikon'}
          </p>
        </div>
      </div>

      {/* Color picker */}
      <div className="space-y-2">
        <Label htmlFor="icon-color">Ikon szín</Label>
        <div className="flex gap-2">
          <Input
            id="icon-color"
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-20 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </div>

      {/* Custom SVG section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Egyedi SVG</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomSvg(!showCustomSvg)}
          >
            <Upload className="w-4 h-4 mr-2" />
            {showCustomSvg ? 'Elrejt' : 'Feltöltés'}
          </Button>
        </div>

        {showCustomSvg && (
          <div className="space-y-2">
            <Textarea
              value={svgInput}
              onChange={(e) => setSvgInput(e.target.value)}
              placeholder='<svg>...</svg>'
              rows={4}
              className="font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onCustomSvgChange(svgInput);
                  setShowCustomSvg(false);
                }}
              >
                Alkalmaz
              </Button>
              {customSvg && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onCustomSvgChange(null);
                    setSvgInput('');
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Törlés
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Icon search */}
      <div className="space-y-2">
        <Label htmlFor="icon-search">Lucide ikon keresése</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="icon-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pl. home, user, settings..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Icon grid */}
      <ScrollArea className="h-[300px] border rounded-lg p-2">
        <div className="grid grid-cols-8 gap-2">
          {filteredIcons.map((iconName) => {
            const IconComponent = (LucideIcons as any)[iconName];
            const isSelected = iconName === currentIcon && !customSvg;
            
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => {
                  onIconSelect(iconName);
                  onCustomSvgChange(null); // Clear custom SVG when selecting Lucide icon
                }}
                className={`p-3 rounded-md hover:bg-muted transition-colors ${
                  isSelected ? 'bg-primary/10 ring-2 ring-primary' : ''
                }`}
                title={iconName}
              >
                <IconComponent className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {filteredIcons.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nincs találat a keresésre
        </p>
      )}
    </div>
  );
}
