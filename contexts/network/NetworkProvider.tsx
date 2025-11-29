import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Network from "expo-network";

type NetworkContextValue = {
  isOnline: boolean;
  isOffline: boolean;
  lastChange: number;
};

const NetworkContext = createContext<NetworkContextValue | null>(null);

const normalizeState = (state: Network.NetworkState): boolean => {
  return !!state.isConnected && state.isInternetReachable !== false;
};

export const NetworkProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<NetworkContextValue>({
    isOnline: true,
    isOffline: false,
    lastChange: Date.now(),
  });

  useEffect(() => {
    let isMounted = true;

    const syncState = (netState: Network.NetworkState) => {
      const isOnline = normalizeState(netState);
      if (!isMounted) return;
      setState({
        isOnline,
        isOffline: !isOnline,
        lastChange: Date.now(),
      });
    };

    Network.getNetworkStateAsync()
      .then((netState) => {
        if (netState) {
          syncState(netState);
        }
      })
      .catch(() => {});

    const subscription = Network.addNetworkStateListener(syncState);

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const value = useMemo(
    () => ({
      isOnline: state.isOnline,
      isOffline: state.isOffline,
      lastChange: state.lastChange,
    }),
    [state.isOffline, state.isOnline, state.lastChange],
  );

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};

export const useNetworkStatus = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetworkStatus must be used within a NetworkProvider");
  }
  return context;
};
