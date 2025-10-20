import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Globe, 
  Mail, 
  Layout, 
  ShoppingCart, 
  CheckCircle, 
  GitBranch 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NodeType = 'traffic' | 'email' | 'landing' | 'checkout' | 'thankyou' | 'condition';

interface NodeTypeOption {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const nodeTypes: NodeTypeOption[] = [
  {
    type: 'traffic',
    label: 'Traffic Source',
    icon: <Globe className="w-6 h-6" />,
    description: 'Starting point for your funnel',
  },
  {
    type: 'email',
    label: 'Email',
    icon: <Mail className="w-6 h-6" />,
    description: 'Email marketing step',
  },
  {
    type: 'landing',
    label: 'Landing Page',
    icon: <Layout className="w-6 h-6" />,
    description: 'Landing or content page',
  },
  {
    type: 'checkout',
    label: 'Checkout',
    icon: <ShoppingCart className="w-6 h-6" />,
    description: 'Payment or checkout step',
  },
  {
    type: 'thankyou',
    label: 'Thank You',
    icon: <CheckCircle className="w-6 h-6" />,
    description: 'Confirmation or success page',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: <GitBranch className="w-6 h-6" />,
    description: 'Split flow based on condition',
  },
];

interface InsertNodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectType: (type: NodeType) => void;
}

export function InsertNodeDialog({
  open,
  onClose,
  onSelectType,
}: InsertNodeDialogProps) {
  const handleSelect = (type: NodeType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Node Type</DialogTitle>
          <DialogDescription>
            Choose the type of node to insert into your funnel
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => handleSelect(nodeType.type)}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-all",
                "hover:border-primary hover:bg-accent/50",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "group"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="text-primary group-hover:scale-110 transition-transform">
                  {nodeType.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    {nodeType.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {nodeType.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
