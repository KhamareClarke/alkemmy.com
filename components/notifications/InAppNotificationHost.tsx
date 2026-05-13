'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Toaster } from '@/components/ui/toaster';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useInAppNotifications } from '@/lib/notifications/in-app-context';
import { X } from 'lucide-react';

export function InAppNotificationHost() {
  const pathname = usePathname();
  const {
    notifyNewReview,
    paymentAlert,
    dismissPaymentAlert,
    stockBanner,
    dismissStockBanner,
  } = useInAppNotifications();

  useEffect(() => {
    if (!pathname?.startsWith('/admin')) return;

    const channel = supabase
      .channel('reviews-insert-notify')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reviews' },
        () => {
          notifyNewReview();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [pathname, notifyNewReview]);

  return (
    <>
      <Toaster />
      {stockBanner && (
        <div
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-3 bg-amber-600 px-4 py-2.5 text-sm font-medium text-black shadow-md"
          role="status"
        >
          <span className="text-center">{stockBanner}</span>
          <button
            type="button"
            onClick={dismissStockBanner}
            className="rounded p-1 hover:bg-black/10"
            aria-label="Dismiss stock alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <AlertDialog open={paymentAlert.open} onOpenChange={(open) => !open && dismissPaymentAlert()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{paymentAlert.title}</AlertDialogTitle>
            <AlertDialogDescription>{paymentAlert.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={dismissPaymentAlert}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
