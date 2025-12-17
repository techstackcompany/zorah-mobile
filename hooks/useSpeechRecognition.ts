import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

type RecognitionState = "idle" | "recording" | "processing" | "error";

interface UseSpeechRecognitionOptions {
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  autoStop?: boolean;
  maxDuration?: number; // in milliseconds, default 30s
}

export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions = {},
) => {
  const { onResult, onError, autoStop = true, maxDuration = 30000 } = options;

  const [state, setState] = useState<RecognitionState>("idle");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check and request permissions
  const requestPermission = useCallback(async () => {
    try {
      const result =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      const granted = result.granted;
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error("Permission error:", error);
      setHasPermission(false);
      return false;
    }
  }, []);

  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const result = await ExpoSpeechRecognitionModule.getPermissionsAsync();
        setHasPermission(result.granted);
      } catch (error) {
        console.error("Permission check error:", error);
        setHasPermission(false);
      }
    };
    checkPermissions();
  }, []);

  // Handle speech recognition results
  useSpeechRecognitionEvent("result", (event) => {
    const transcribedText = event.results[0]?.transcript || "";
    setTranscript(transcribedText);

    if (event.isFinal && transcribedText) {
      onResult?.(transcribedText);
      setState("idle");
      setTranscript("");
    }
  });

  // Handle speech recognition errors
  useSpeechRecognitionEvent("error", (event) => {
    console.error("Speech recognition error:", event.error);
    const errorMessage = event.error || "Speech recognition failed";
    onError?.(errorMessage);
    setState("error");
    setTimeout(() => setState("idle"), 2000);
  });

  // Handle speech recognition end
  useSpeechRecognitionEvent("end", () => {
    setState("idle");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  });

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Check permissions first
      let granted = hasPermission;
      if (!granted) {
        granted = await requestPermission();
      }

      if (!granted) {
        onError?.("Microphone permission not granted");
        setState("error");
        setTimeout(() => setState("idle"), 2000);
        return false;
      }

      // Start speech recognition
      setState("recording");
      setTranscript("");

      const options: any = {
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
      };

      // Platform-specific settings
      if (Platform.OS === "ios") {
        options.contextualStrings = [
          "expense",
          "income",
          "budget",
          "savings",
          "investment",
        ];
      }

      ExpoSpeechRecognitionModule.start(options);

      // Auto-stop after maxDuration
      if (autoStop) {
        timeoutRef.current = setTimeout(() => {
          stopRecording();
        }, maxDuration);
      }

      return true;
    } catch (error) {
      console.error("Start recording error:", error);
      onError?.("Failed to start recording");
      setState("error");
      setTimeout(() => setState("idle"), 2000);
      return false;
    }
  }, [
    hasPermission,
    requestPermission,
    onError,
    autoStop,
    maxDuration,
    stopRecording,
  ]);

  // Stop recording
  const stopRecording = useCallback(() => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      ExpoSpeechRecognitionModule.stop();
      setState("processing");
    } catch (err) {
      console.error("Stop recording error:", err);
      setState("idle");
    }
  }, []);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      ExpoSpeechRecognitionModule.abort();
      setState("idle");
      setTranscript("");
    } catch (error) {
      console.error("Cancel recording error:", error);
      setState("idle");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  return {
    state,
    hasPermission,
    transcript,
    startRecording,
    stopRecording,
    cancelRecording,
    requestPermission,
    isRecording: state === "recording",
    isProcessing: state === "processing",
    isIdle: state === "idle",
    hasError: state === "error",
  };
};
