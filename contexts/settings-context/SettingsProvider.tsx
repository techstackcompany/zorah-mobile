import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type LanguageOption = {
  id: string;
  label: string;
  subLabel: string;
};

type SettingsState = {
  pushNotification: boolean;
};

type SettingsContextValue = {
  settings: SettingsState;
  isLoaded: boolean;
  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
  resetSettings: () => void;
};



const defaultSettings: SettingsState = {

 
  pushNotification: true,
};

export type { LanguageOption };

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    const getSettings = async () => {
      try {
        const settings = await AsyncStorage.getItem("settings");
        if (settings) {
          setSettings(JSON.parse(settings));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoaded(true);
      }
    };
    getSettings();
  }, []);

  const updateSetting: SettingsContextValue["updateSetting"] = useCallback(
    async (key, value) => {
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };
        AsyncStorage.setItem("settings", JSON.stringify(newSettings));
        return newSettings;
      });
    },
    [],
  );

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    AsyncStorage.setItem("settings", JSON.stringify(defaultSettings));
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      isLoaded,
      updateSetting,
      resetSettings,
    }),
    [settings, isLoaded, updateSetting, resetSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
