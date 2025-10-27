import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as Phosphor from '@phosphor-icons/react';
import * as SimpleIcons from 'react-icons/si';

interface IconPickerProps {
  currentIcon?: string;
  onIconSelect: (iconName: string) => void;
}

// Curated list of Phosphor icon names for the picker (UI Icons)
const PHOSPHOR_ICON_NAMES = [
  // Source / Campaign
  'MegaphoneSimple', 'ShareNetwork', 'TrendUp', 'ChartLineUp', 'Rocket',
  // Page / Web / Landing
  'Monitor', 'Browser', 'FileText', 'Article', 'Devices',
  // Action / Automation / Email
  'Envelope', 'Lightning', 'Robot', 'GearSix', 'Gear', 'PaperPlaneRight',
  // Delay
  'Clock', 'Hourglass', 'Timer',
  // Condition / Branch
  'GitFork', 'ArrowsSplit', 'Path',
  // Data / Measurement
  'ChartLine', 'Target', 'ChartBar', 'ChartPie',
  // Gift / Offer
  'Gift', 'Sparkle', 'Tag', 'Percent',
  // Shopping / Checkout
  'ShoppingCart', 'CreditCard', 'Money',
  // Success / Thank You
  'CheckCircle', 'Confetti', 'Smiley', 'Star',
  // Custom / Other
  'Cube', 'Question', 'DotsThree', 'Database', 'Users', 'User'
];

// Curated list of brand icon names (Simple Icons)
const BRAND_ICON_NAMES = [
  // Social Media
  'Facebook', 'Instagram', 'Twitter', 'Tiktok', 'Linkedin', 'Youtube', 
  'Snapchat', 'Pinterest', 'Reddit', 'Threads', 'X',
  // Advertising Platforms
  'Googleads', 'Meta', 'Microsoftadvertising',
  // Email Marketing
  'Gmail', 'Mailchimp', 'Sendinblue', 'Constantcontact',
  // E-commerce
  'Shopify', 'Woocommerce', 'Stripe', 'Paypal', 'Amazon',
  // Other Popular Brands
  'Google', 'Apple', 'Microsoft', 'Whatsapp', 'Telegram'
];

export function IconPicker({
  currentIcon = 'Question',
  onIconSelect
}: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ui' | 'brand'>('ui');

  // Determine if current icon is a brand icon
  const isBrandIcon = currentIcon.startsWith('simple:');
  const cleanIconName = isBrandIcon ? currentIcon.replace('simple:', '') : currentIcon;

  const filteredPhosphorIcons = useMemo(() => {
    return PHOSPHOR_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const filteredBrandIcons = useMemo(() => {
    return BRAND_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // Get current icon component for preview
  let CurrentIconComponent: any;
  let currentIconLabel = cleanIconName;
  
  if (isBrandIcon) {
    CurrentIconComponent = (SimpleIcons as any)[`Si${cleanIconName}`] || Phosphor.Question;
    currentIconLabel = cleanIconName;
  } else {
    CurrentIconComponent = (Phosphor as any)[cleanIconName] || Phosphor.Question;
  }

  return (
    <div className="space-y-4">
      {/* Current icon preview */}
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
        <CurrentIconComponent size={24} />
        <div>
          <p className="text-sm font-medium">{currentIconLabel}</p>
          <p className="text-xs text-muted-foreground">
            {isBrandIcon ? 'Brand ikon' : 'Phosphor ikon'}
          </p>
        </div>
      </div>

      {/* Tabs for UI vs Brand icons */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'ui' | 'brand')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ui">UI Ikonok</TabsTrigger>
          <TabsTrigger value="brand">Brand Ikonok</TabsTrigger>
        </TabsList>

        {/* Icon search */}
        <div className="space-y-2 mt-4">
          <Label>Ikon keresése</Label>
          <div className="relative">
            <Phosphor.MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'ui' ? "Pl. megaphone, monitor..." : "Pl. Facebook, Google..."}
              className="pl-10"
            />
          </div>
        </div>

        {/* UI Icons Tab */}
        <TabsContent value="ui" className="mt-4">
          <ScrollArea className="h-[300px] border rounded-lg p-2">
            <div className="grid grid-cols-6 gap-2">
              {filteredPhosphorIcons.map((iconName) => {
                const IconComponent = (Phosphor as any)[iconName];
                const isSelected = !isBrandIcon && iconName === currentIcon;
                
                if (!IconComponent) {
                  console.warn(`Icon ${iconName} not found in Phosphor Icons`);
                  return null;
                }
                
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

          {filteredPhosphorIcons.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nincs találat
            </p>
          )}
        </TabsContent>

        {/* Brand Icons Tab */}
        <TabsContent value="brand" className="mt-4">
          <ScrollArea className="h-[300px] border rounded-lg p-2">
            <div className="grid grid-cols-6 gap-2">
              {filteredBrandIcons.map((iconName) => {
                const IconComponent = (SimpleIcons as any)[`Si${iconName}`];
                const iconValue = `simple:${iconName}`;
                const isSelected = currentIcon === iconValue;
                
                if (!IconComponent) {
                  console.warn(`Icon ${iconName} not found in Simple Icons`);
                  return null;
                }
                
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => onIconSelect(iconValue)}
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

          {filteredBrandIcons.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nincs találat
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
