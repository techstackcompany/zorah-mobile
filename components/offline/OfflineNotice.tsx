import Text from "@/components/ui/Text";
import { useNetworkStatus } from "@/contexts/network/NetworkProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

const OfflineNotice = () => {
  const { isOffline } = useNetworkStatus();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setVisible(true);
      return;
    }

    const timeout = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timeout);
  }, [isOffline]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute top-4 left-4 right-4 z-50"
    >
      <View
        className={`flex-row items-center justify-center rounded-2xl px-3 py-2 ${isOffline ? "bg-neutral-900/90" : "bg-emerald-600/90"}`}
      >
        <Ionicons
          name={isOffline ? "cloud-offline-outline" : "cloud-done-outline"}
          size={16}
          color="#fff"
        />
        <Text weight="semibold" className="ml-2 text-xs text-white">
          {isOffline ? "Offline mode: showing saved data" : "Back online"}
        </Text>
      </View>
    </View>
  );
};

export default OfflineNotice;
