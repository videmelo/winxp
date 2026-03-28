import { useCallback } from 'react';
import { useWindowManager } from './useWindowManager';
import ErrorDialog from '../components/ui/ErrorDialog';

export function useErrorDialog() {
   const { openWindow } = useWindowManager();

   const showError = useCallback(
      (message: string, title: string = 'System Error', options?: { width?: number; height?: number }) => {
         openWindow({
            programId: 'error-dialog',
            title,
            icon: 'error-dialog',
            exe: ErrorDialog,
            params: { message, type: 'error' },
            size: { width: options?.width ?? 380, height: options?.height ?? 160 },
            resizable: false,
            titleBarButtons: ['close'],
         });
      },
      [openWindow],
   );

   const showWarning = useCallback(
      (message: string, title: string = 'System Warning', options?: { width?: number; height?: number }) => {
         openWindow({
            programId: 'warn-dialog',
            title,
            icon: 'warn-dialog',
            exe: ErrorDialog,
            params: { message, type: 'warning' },
            size: { width: options?.width ?? 380, height: options?.height ?? 160 },
            resizable: false,
            titleBarButtons: ['close'],
         });
      },
      [openWindow],
   );

   return { showError, showWarning };
}
