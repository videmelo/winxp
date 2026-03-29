import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import {
   programs,
   folders,
   type Program,
   type Folder,
   type TitleBarButton,
   type WindowConfig,
} from '../utils/programs';
import ErrorDialog from '../components/ui/ErrorDialog';

let registry: Map<string, Program | Folder> | null = null;
function getRegistry() {
   if (!registry) {
      registry = new Map<string, Program | Folder>([...programs, ...folders].map((item) => [item.id, item]));
   }
   return registry;
}

export type WindowStatus = 'normal' | 'minimized' | 'maximized';

export type WindowPosition = { x: number; y: number };
export type WindowSize = { width: number; height: number };

export type WindowState = {
   id: string;
   programId: string;
   title: string;
   icon: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   exe?: React.ComponentType<any>;
   position: WindowPosition;
   prevPosition: WindowPosition | null;
   size: WindowSize;
   prevSize: WindowSize | null;
   minSize: WindowSize;
   maxSize: WindowSize | null;
   status: WindowStatus;
   preMinimizedStatus?: WindowStatus;
   zIndex: number;
   isActive: boolean;
   titleBarButtons: TitleBarButton[];
   resizable: boolean;
   isLoading?: boolean;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   params?: any;
};

export type OpenWindowOptions = {
   programId: string;
   title: string;
   icon: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   exe?: React.ComponentType<any>;
   position?: WindowPosition;
   size?: WindowSize;
   minSize?: WindowSize;
   maxSize?: WindowSize | null;
   defaultStatus?: WindowStatus;
   titleBarButtons?: TitleBarButton[];
   resizable?: boolean;
   isLoading?: boolean;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   params?: any;
};

export type OpenProgramOptions = {
   position?: WindowPosition;
   size?: WindowSize;
   minSize?: WindowSize;
};

type Action =
   | { type: 'OPEN_WINDOW'; payload: OpenWindowOptions }
   | { type: 'CLOSE_WINDOW'; payload: { id: string } }
   | { type: 'MINIMIZE_WINDOW'; payload: { id: string } }
   | { type: 'MAXIMIZE_WINDOW'; payload: { id: string } }
   | { type: 'RESTORE_WINDOW'; payload: { id: string } }
   | { type: 'FOCUS_WINDOW'; payload: { id: string } }
   | { type: 'MOVE_WINDOW'; payload: { id: string; position: WindowPosition } }
   | { type: 'RESIZE_WINDOW'; payload: { id: string; size: WindowSize; position?: WindowPosition } }
   | { type: 'TOGGLE_MAXIMIZE'; payload: { id: string } }
   | { type: 'SET_WINDOW_LOADED'; payload: { id: string } };

type ManagerState = {
   windows: WindowState[];
   nextZIndex: number;
};

const initialState: ManagerState = {
   windows: [],
   nextZIndex: 100,
};

let windowIdCounter = 0;
function generateId(): string {
   return `win-${++windowIdCounter}`;
}

function setActive(windows: WindowState[], activeId: string): WindowState[] {
   return windows.map((w) => ({
      ...w,
      isActive: w.id === activeId,
   }));
}

function reducer(state: ManagerState, action: Action): ManagerState {
   switch (action.type) {
      case 'OPEN_WINDOW': {
         const {
            programId,
            title,
            icon,
            exe,
            position,
            size,
            minSize,
            maxSize,
            defaultStatus,
            titleBarButtons,
            resizable,
            isLoading,
            params,
         } = action.payload;
         const id = generateId();
         const zIndex = state.nextZIndex;
         const initialStatus = defaultStatus ?? 'normal';

         const newWindow: WindowState = {
            id,
            programId,
            title,
            icon,
            exe,
            position:
               initialStatus === 'maximized'
                  ? { x: 0, y: 0 }
                  : (position ?? { x: 100 + (state.windows.length % 8) * 30, y: 80 + (state.windows.length % 8) * 30 }),
            prevPosition:
               initialStatus === 'maximized'
                  ? (position ?? { x: 100 + (state.windows.length % 8) * 30, y: 80 + (state.windows.length % 8) * 30 })
                  : null,
            size:
               initialStatus === 'maximized'
                  ? { width: window.innerWidth, height: window.innerHeight - 30 }
                  : (size ?? { width: 640, height: 480 }),
            prevSize: initialStatus === 'maximized' ? (size ?? { width: 640, height: 480 }) : null,
            minSize: minSize ?? { width: 200, height: 150 },
            maxSize: maxSize ?? null,
            status: initialStatus,
            zIndex,
            isActive: !isLoading,
            titleBarButtons: titleBarButtons ?? ['minimize', 'maximize', 'close'],
            resizable: resizable ?? true,
            isLoading: isLoading ?? false,
            params,
         };

         const updatedWindows = isLoading
            ? [...state.windows, newWindow]
            : [...setActive(state.windows, id), newWindow];

         return {
            windows: updatedWindows,
            nextZIndex: zIndex + 1,
         };
      }

      case 'CLOSE_WINDOW': {
         const remaining = state.windows.filter((w) => w.id !== action.payload.id);

         if (remaining.length > 0) {
            const topWindow = remaining.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
            return { ...state, windows: setActive(remaining, topWindow.id) };
         }
         return { ...state, windows: remaining };
      }

      case 'MINIMIZE_WINDOW': {
         const windows = state.windows.map((w) =>
            w.id === action.payload.id
               ? { ...w, status: 'minimized' as WindowStatus, preMinimizedStatus: w.status, isActive: false }
               : w,
         );

         const visible = windows.filter((w) => w.status !== 'minimized' && !w.isLoading);
         if (visible.length > 0) {
            const topWindow = visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
            return { ...state, windows: setActive(windows, topWindow.id) };
         }
         return { ...state, windows };
      }

      case 'MAXIMIZE_WINDOW': {
         return {
            ...state,
            windows: state.windows.map((w) =>
               w.id === action.payload.id
                  ? {
                       ...w,
                       prevPosition: w.position,
                       prevSize: w.size,
                       position: { x: 0, y: 0 },
                       size: { width: window.innerWidth, height: window.innerHeight - 30 },
                       status: 'maximized' as WindowStatus,
                    }
                  : w,
            ),
         };
      }

      case 'RESTORE_WINDOW': {
         return {
            ...state,
            windows: setActive(
               state.windows.map((w) =>
                  w.id === action.payload.id
                     ? {
                          ...w,
                          position: w.prevPosition ?? w.position,
                          size: w.prevSize ?? w.size,
                          prevPosition: null,
                          prevSize: null,
                          status: 'normal' as WindowStatus,
                       }
                     : w,
               ),
               action.payload.id,
            ),
            nextZIndex: state.nextZIndex + 1,
         };
      }

      case 'TOGGLE_MAXIMIZE': {
         const win = state.windows.find((w) => w.id === action.payload.id);
         if (!win) return state;
         if (win.status === 'maximized') {
            return reducer(state, { type: 'RESTORE_WINDOW', payload: { id: win.id } });
         }
         return reducer(state, { type: 'MAXIMIZE_WINDOW', payload: { id: win.id } });
      }

      case 'FOCUS_WINDOW': {
         const zIndex = state.nextZIndex;
         return {
            windows: setActive(
               state.windows.map((w) =>
                  w.id === action.payload.id
                     ? {
                          ...w,
                          zIndex,
                          status: w.status === 'minimized' ? (w.prevSize ? 'maximized' : 'normal') : w.status,
                       }
                     : w,
               ),
               action.payload.id,
            ),
            nextZIndex: zIndex + 1,
         };
      }

      case 'MOVE_WINDOW': {
         return {
            ...state,
            windows: state.windows.map((w) =>
               w.id === action.payload.id ? { ...w, position: action.payload.position } : w,
            ),
         };
      }

      case 'RESIZE_WINDOW': {
         return {
            ...state,
            windows: state.windows.map((w) => {
               if (w.id !== action.payload.id) return w;
               let { width, height } = action.payload.size;
               if (w.maxSize) {
                  width = Math.min(width, w.maxSize.width);
                  height = Math.min(height, w.maxSize.height);
               }
               width = Math.max(width, w.minSize.width);
               height = Math.max(height, w.minSize.height);
               return {
                  ...w,
                  size: { width, height },
                  ...(action.payload.position ? { position: action.payload.position } : {}),
               };
            }),
         };
      }

      case 'SET_WINDOW_LOADED': {
         const windows = state.windows.map((w) =>
            w.id === action.payload.id
               ? { ...w, isLoading: false, isActive: true, zIndex: state.nextZIndex }
               : { ...w, isActive: false },
         );
         return {
            ...state,
            windows,
            nextZIndex: state.nextZIndex + 1,
         };
      }

      default:
         return state;
   }
}

type WindowManagerContextType = {
   windows: WindowState[];
   openWindow: (options: OpenWindowOptions) => void;
   openProgram: (programId: string, options?: OpenProgramOptions) => void;
   closeWindow: (id: string) => void;
   minimizeWindow: (id: string) => void;
   maximizeWindow: (id: string) => void;
   restoreWindow: (id: string) => void;
   toggleMaximize: (id: string) => void;
   focusWindow: (id: string) => void;
   moveWindow: (id: string, position: WindowPosition) => void;
   resizeWindow: (id: string, size: WindowSize, position?: WindowPosition) => void;
   getWindow: (id: string) => WindowState | undefined;
   setWindowLoaded: (id: string) => void;
};

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
   const [state, dispatch] = useReducer(reducer, initialState);
   const stateRef = useRef(state);

   useEffect(() => {
      stateRef.current = state;
   }, [state]);

   const openWindow = useCallback((options: OpenWindowOptions) => {
      dispatch({ type: 'OPEN_WINDOW', payload: options });
   }, []);

   const openProgram = useCallback(
      (programId: string, options?: OpenProgramOptions) => {
         const item = getRegistry().get(programId);
         if (!item) {
            console.warn(`[WINDOW] Program not found: "${programId}"`);
            return;
         }

         const cfg: WindowConfig | undefined = 'windowConfig' in item ? item.windowConfig : undefined;

         // Check for single instance
         if (cfg?.singleInstance) {
            const existingWindow = stateRef.current.windows.find((w) => w.programId === programId);
            if (existingWindow) {
               dispatch({ type: 'FOCUS_WINDOW', payload: { id: existingWindow.id } });
               return;
            }
         }

         const exe = 'exe' in item ? item.exe : undefined;
         if (!exe) {
            dispatch({
               type: 'OPEN_WINDOW',
               payload: {
                  programId: 'error-dialog',
                  title: 'System Error',
                  icon: 'error-dialog',
                  exe: ErrorDialog,
                  params: {
                     message: `The program "${item.name}" does not have a configured executable.`,
                     type: 'error',
                  },
                  size: { width: 380, height: 160 },
                  resizable: false,
                  titleBarButtons: ['close'],
               },
            });
            return;
         }
         const isLoading = cfg?.isLoading ?? false;

         dispatch({
            type: 'OPEN_WINDOW',
            payload: {
               programId: item.id,
               title: item.name,
               icon: item.id,
               exe,
               size: cfg?.defaultSize,
               minSize: cfg?.minSize,
               maxSize: cfg?.maxSize ?? null,
               position: cfg?.defaultPosition,
               defaultStatus: cfg?.defaultStatus,
               titleBarButtons: cfg?.titleBarButtons,
               resizable: cfg?.resizable,
               isLoading,
               ...options,
            },
         });
      },
      [dispatch],
   );

   const closeWindow = useCallback((id: string) => {
      dispatch({ type: 'CLOSE_WINDOW', payload: { id } });
   }, []);

   const minimizeWindow = useCallback((id: string) => {
      dispatch({ type: 'MINIMIZE_WINDOW', payload: { id } });
   }, []);

   const maximizeWindow = useCallback((id: string) => {
      dispatch({ type: 'MAXIMIZE_WINDOW', payload: { id } });
   }, []);

   const restoreWindow = useCallback((id: string) => {
      dispatch({ type: 'RESTORE_WINDOW', payload: { id } });
   }, []);

   const toggleMaximize = useCallback((id: string) => {
      dispatch({ type: 'TOGGLE_MAXIMIZE', payload: { id } });
   }, []);

   const focusWindow = useCallback((id: string) => {
      const win = stateRef.current.windows.find((w) => w.id === id);
      if (win && !win.isLoading) {
         dispatch({ type: 'FOCUS_WINDOW', payload: { id } });
      }
   }, []);

   const moveWindow = useCallback((id: string, position: WindowPosition) => {
      dispatch({ type: 'MOVE_WINDOW', payload: { id, position } });
   }, []);

   const resizeWindow = useCallback((id: string, size: WindowSize, position?: WindowPosition) => {
      dispatch({ type: 'RESIZE_WINDOW', payload: { id, size, position } });
   }, []);

   const getWindow = useCallback((id: string) => {
      return stateRef.current.windows.find((w) => w.id === id);
   }, []);

   const setWindowLoaded = useCallback((id: string) => {
      dispatch({ type: 'SET_WINDOW_LOADED', payload: { id } });
   }, []);

   const value: WindowManagerContextType = {
      windows: state.windows,
      openWindow,
      openProgram,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      toggleMaximize,
      focusWindow,
      moveWindow,
      resizeWindow,
      getWindow,
      setWindowLoaded,
   };

   return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}

export function useWindowManager() {
   const context = useContext(WindowManagerContext);
   if (!context) {
      throw new Error('useWindowManager must be used within a WindowManagerProvider');
   }
   return context;
}
