import { createContext, useContext, useState, useEffect } from "react";
import { getOfflineQueue, addToOfflineQueue, clearOfflineQueue } from "../services/offlineDB";
import api from "../services/api";
import toast from "react-hot-toast";

const OfflineContext = createContext(null);

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = async () => {
      setIsOnline(true);
      toast.success("You're back online! Syncing... ☁️");
      await flushQueue();
    };
    const goOffline = () => {
      setIsOnline(false);
      toast("You're offline. Cached notes still available 📶", { icon: "📵" });
    };

    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // When back online, flush any queued actions (likes, bookmarks)
  const flushQueue = async () => {
    const queue = await getOfflineQueue();
    for (const item of queue) {
      try {
        await api[item.method](item.url, item.data);
      } catch (e) { /* skip failed items */ }
    }
    await clearOfflineQueue();
  };

  // Queue an action for when back online
  const queueAction = async (method, url, data = {}) => {
    await addToOfflineQueue({ method, url, data, queuedAt: Date.now() });
  };

  return (
    <OfflineContext.Provider value={{ isOnline, queueAction }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => useContext(OfflineContext);
