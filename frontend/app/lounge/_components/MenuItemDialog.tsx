"use client";

import SiteImage from "@/components/SiteImage";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MenuItem } from "@/lib/api/types";

const naira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

type MenuItemDialogProps = {
  /** Last-selected item — kept truthy through the close animation so the
   *  dialog doesn't flash empty while it fades out. */
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MenuItemDialog({
  item,
  open,
  onOpenChange,
}: MenuItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {item && (
          <div className="p-6">
            <SiteImage
              src={item.imageUrl}
              alt={item.imageAlt ?? item.name}
              aspect="aspect-[4/3]"
            />
            <DialogHeader className="gap-3 p-0 pt-6">
              <span className="text-xs font-bold tracking-[0.2em] text-boxx-red uppercase">
                {item.category}
              </span>
              <div className="flex items-start justify-between gap-4">
                <DialogTitle>{item.name}</DialogTitle>
                <span className="shrink-0 font-heading text-2xl text-boxx-red-glow">
                  {naira(item.price)}
                </span>
              </div>
              <DialogDescription>{item.description}</DialogDescription>
            </DialogHeader>
            {item.tags && item.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
