import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, Minus, Plus, Trash2, Droplet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore, formatINR } from "@/stores/cartStore";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col sm:max-w-lg">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-6">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nothing here yet</p>
                <Button asChild className="mt-4" onClick={() => setOpen(false)}>
                  <Link to="/products">Browse products</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4 p-2">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-secondary/40 grid place-items-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <Droplet className="h-6 w-6 text-primary/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-medium">{item.name}</h4>
                        {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}
                        <p className="mt-1 font-semibold text-primary">{formatINR(item.price)}</p>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(item.productId)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setQuantity(item.productId, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => setQuantity(item.productId, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 border-t bg-background pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">{formatINR(totalPrice)}</span>
                </div>
                <Button asChild className="w-full" size="lg" onClick={() => setOpen(false)}>
                  <Link to="/checkout">Proceed to checkout <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground">Cash on Delivery or Bank Transfer accepted.</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
