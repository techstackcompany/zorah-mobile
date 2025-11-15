import { useContext } from "react";
import { SettingsContext } from "./SettingsProvider";

const useAppSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useAppSettings must be used inside SettingsProvider");
  return ctx;
};

export default useAppSettings;
