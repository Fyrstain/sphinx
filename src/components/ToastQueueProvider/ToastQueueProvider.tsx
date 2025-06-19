// React
import {
  useState,
  createContext,
  useContext,
  useCallback,
  PropsWithChildren,
} from "react";
// React Bootstrap
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// Styles
import styles from "./ToastQueueProvider.module.css";

////////////////////////////////
//           Props            //
////////////////////////////////

// Config by default, the position and the time in ms to delete the toast
const defaultProps: ToastQueueProviderProps = {
  autohideDelay: 6000,
};

////////////////////////////////
//         Interfaces         //
////////////////////////////////

interface ToastQueueProviderProps {
  autohideDelay?: number;
}

export interface ToastData {
  id: number;
  show: boolean;
  title: any;
  body: any;
  autohide?: boolean;
  icon?: any;
}

interface ToastQueueContextType {
  createToast: (toastData: Omit<ToastData, "id" | "show">) => void;
}

// Context provides createToast({ title, body, autohide = true, bg = undefined }) function
const ToastQueueContext = createContext<ToastQueueContextType | null>(null);

////////////////////////////////
//           Actions          //
////////////////////////////////

// Wrap children in provider component, allowing them to use the context function
export function ToastQueueProvider(
  props: PropsWithChildren<ToastQueueProviderProps>,
) {
  const [queue, setQueue] = useState<Array<ToastData>>([]);
  const { children, autohideDelay } = {
    ...defaultProps,
    ...props,
  };

  const createToast = useCallback(function (
    toastData: Omit<ToastData, "id" | "show">,
  ) {
    setQueue((previousQueue: ToastData[]) => {
      // Check if there's any toast in the queue with the same body
      if (previousQueue.some((toast) => toast.body === toastData.body)) {
        return previousQueue;
      } else {
        // If there's no toast with the same body, a new toast can be created
        return [
          ...previousQueue,
          {
            id: Date.now(),
            show: true,
            // This default gets overwritten if set in toastData
            autohide: true,
            ...toastData,
          },
        ];
      }
    });
  }, []);

  // Begins toast close animation
  function closeToast(id: ToastData["id"]) {
    setQueue((currentQueue: ToastData[]) =>
      currentQueue.map((toast) =>
        toast.id === id ? { ...toast, show: false } : toast,
      ),
    );
  }

  // Removes toast from queue once close animation complete
  function removeToast(id: ToastData["id"]) {
    setQueue((currentQueue: ToastData[]) =>
      currentQueue.filter((toast) => toast.id !== id),
    );
  }

  //////////////////////////////
  //          Content         //
  //////////////////////////////

  return (
    <ToastQueueContext.Provider value={{ createToast }}>
      {children}
      <ToastContainer
        className="position-fixed p-3 m-5"
        position="middle-center"
      >
        {queue.map((toast: ToastData) => (
          <Toast
            key={toast.id}
            show={toast.show}
            onClose={() => closeToast(toast.id)}
            onExited={() => removeToast(toast.id)}
            delay={autohideDelay}
            autohide={toast.autohide}
            bg="light"
          >
            <Toast.Header>
              <FontAwesomeIcon icon={toast.icon} className="iconToast" />
              <strong className="me-auto">{toast.title}</strong>
            </Toast.Header>
            <Toast.Body className={styles.toastOpacity}>
              {toast.body}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastQueueContext.Provider>
  );
}

// Context provides createToast({ title, body, autohide = true, bg = undefined }) function
ToastQueueProvider.useToastQueue = function () {
  const context = useContext(ToastQueueContext);
  if (context === null)
    throw new Error(
      "ToastQueueContext cannot be used outside of ToastQueueProvider",
    );
  return context;
};
