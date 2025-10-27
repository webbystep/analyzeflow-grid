import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { icons } from 'lucide-react';
import { Search } from 'lucide-react';

interface IconPickerProps {
  currentIcon?: string;
  onIconSelect: (iconName: string) => void;
}

// Get list of all Lucide icon names
const LUCIDE_ICON_NAMES = Object.keys(icons).filter(
  (key) => !['createLucideIcon', 'default'].includes(key)
);

export function IconPicker({
  currentIcon = 'Box',
  onIconSelect
}: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    return LUCIDE_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 100); // Limit to 100 for performance
  }, [search]);

  const CurrentIconComponent = icons[currentIcon as keyof typeof icons] || icons.Box;

  return (
    <div className="space-y-4">
      {/* Current icon preview */}
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
        <CurrentIconComponent className="w-6 h-6" />
        <div>
          <p className="text-sm font-medium">{currentIcon}</p>
          <p className="text-xs text-muted-foreground">Lucide ikon</p>
        </div>
      </div>

      {/* Icon search */}
      <div className="space-y-2">
        <Label>Ikon keresése</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pl. home, user, rocket..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Icon grid */}
      <ScrollArea className="h-[300px] border rounded-lg p-2">
        <div className="grid grid-cols-6 gap-2">
          {filteredIcons.map((iconName) => {
            const IconComponent = icons[iconName as keyof typeof icons];
            const isSelected = iconName === currentIcon;
            
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => onIconSelect(iconName)}
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
          Nincs találat
        </p>
      )}
    </div>
  );
}
