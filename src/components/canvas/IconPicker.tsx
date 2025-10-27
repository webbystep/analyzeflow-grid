import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as Phosphor from '@phosphor-icons/react';

interface IconPickerProps {
  currentIcon?: string;
  onIconSelect: (iconName: string) => void;
}

// Curated list of Phosphor icon names for the picker
const PHOSPHOR_ICON_NAMES = [
  // Source / Campaign
  'MegaphoneSimple', 'ShareNetwork', 'TrendUp', 'ChartLineUp', 'Broadcast',
  // Page / Web / Landing
  'Monitor', 'Browser', 'FileText', 'Article', 'Devices',
  // Action / Automation / Email
  'Envelope', 'Lightning', 'Robot', 'GearSix', 'Gear', 'PaperPlaneRight',
  // Delay
  'Clock', 'Hourglass', 'Timer',
  // Condition / Branch
  'GitFork', 'ArrowsSplit', 'FlowArrow', 'Path',
  // Data / Measurement
  'ChartLine', 'Graph', 'Target', 'ChartBar', 'ChartPie',
  // Gift / Offer
  'Gift', 'Sparkle', 'Tag', 'Percent',
  // Shopping / Checkout
  'ShoppingCart', 'CreditCard', 'Money',
  // Success / Thank You
  'CheckCircle', 'Confetti', 'Smiley', 'Star',
  // Custom / Other
  'Cube', 'Question', 'Dots', 'Database', 'Users', 'User'
];

export function IconPicker({
  currentIcon = 'Box',
  onIconSelect
}: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    return PHOSPHOR_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const CurrentIconComponent = (Phosphor as any)[currentIcon] || Phosphor.Question;

  return (
    <div className="space-y-4">
      {/* Current icon preview */}
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
        <CurrentIconComponent size={24} />
        <div>
          <p className="text-sm font-medium">{currentIcon}</p>
          <p className="text-xs text-muted-foreground">Phosphor ikon</p>
        </div>
      </div>

      {/* Icon search */}
      <div className="space-y-2">
        <Label>Ikon keresése</Label>
        <div className="relative">
          <Phosphor.MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pl. megaphone, monitor, envelope..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Icon grid */}
      <ScrollArea className="h-[300px] border rounded-lg p-2">
        <div className="grid grid-cols-6 gap-2">
          {filteredIcons.map((iconName) => {
            const IconComponent = (Phosphor as any)[iconName];
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
                <IconComponent size={20} />
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
