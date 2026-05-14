import { useOffline } from "../../context/OfflineContext";

export default function OfflineBanner() {
  const { isOnline } = useOffline();
  if (isOnline) return null;

  return (
    <div className="offline-banner fixed top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm text-amber-950 text-center text-sm font-semibold py-2 px-4">
      📵 You're offline — showing cached notes. Likes & bookmarks will sync when you reconnect.
    </div>
  );
}
