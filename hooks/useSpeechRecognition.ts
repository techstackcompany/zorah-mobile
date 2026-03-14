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
  maxDuration?: number;
}

export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions = {},
) => {
  const { onResult, onError, autoStop = true, maxDuration = 30000 } = options;

  const [state, setState] = useState<RecognitionState>("idle");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState("");
  const timeoutRef = useRef<number | null>(null);

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

  
  useSpeechRecognitionEvent("result", (event) => {
    const transcribedText = event.results[0]?.transcript || "";
    setTranscript(transcribedText);

    if (event.isFinal && transcribedText) {
      onResult?.(transcribedText);
      setState("idle");
      setTranscript("");
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("Speech recognition error:", event.error);
    const errorMessage = event.error || "Speech recognition failed";
    onError?.(errorMessage);
    setState("error");
    setTimeout(() => setState("idle"), 2000);
  });

  
  useSpeechRecognitionEvent("end", () => {
    setState("idle");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  });
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

  
  const startRecording = useCallback(async () => {
    try {
      
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

      
      setState("recording");
      setTranscript("");

      const options: any = {
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
      };

      
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

  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        
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
