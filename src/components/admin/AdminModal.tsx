import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function AdminModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = "max-w-4xl",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${maxWidth} max-h-[90vh] w-[94vw] overflow-y-auto border border-border bg-background p-6 shadow-2xl sm:p-8`}
      >
        <DialogHeader className="mb-6 border-b border-border/40 pb-4 text-left">
          <DialogTitle className="text-xl font-serif tracking-wide text-foreground">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="mt-1 text-xs text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="relative">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
