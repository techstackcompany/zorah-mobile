import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import type { PermissionStatus } from "expo-modules-core";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";

const startSound = require("@/assets/sounds/record-start.wav");
const endSound = require("@/assets/sounds/record-cancel.wav");

const useVoiceTranscriber = (enableSounds = true) => {
  const startPlayer = useAudioPlayer(enableSounds ? startSound : undefined);
  const endPlayer = useAudioPlayer(enableSounds ? endSound : undefined);
  const startPlayerStatus = useAudioPlayerStatus(startPlayer);
  const endPlayerStatus = useAudioPlayerStatus(endPlayer);

  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Always-current ref — avoids stale-closure race between "result" and "end" events
  const accumulatedRef = useRef("");

  const hasPermission = useRef(false);
  const permissionStatus = useRef<PermissionStatus | null>(null);
  const autoStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check existing permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await ExpoSpeechRecognitionModule.getPermissionsAsync();
        if (result.granted) {
          permissionStatus.current = result.status;
          hasPermission.current = true;
        } else {
          permissionStatus.current = result.status ?? null;
        }
      } catch (err) {
        console.error("Error checking permissions:", err);
        setError("Failed to check microphone permissions");
      }
    };
    checkPermission();
  }, []);

  // Abort any active session when the component unmounts
  useEffect(() => {
    return () => {
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
      }
      ExpoSpeechRecognitionModule.abort();
    };
  }, []);

  useEffect(() => {
    if (startPlayerStatus.isLoaded) {
      startPlayer.volume = 0.8;
    }
    if (endPlayerStatus.isLoaded) {
      endPlayer.volume = 0.7;
    }
  }, [
    startPlayer,
    startPlayerStatus.isLoaded,
    endPlayer,
    endPlayerStatus.isLoaded,
  ]);

  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    setError(null);
  });

  // Clear the 20-second safety timeout when the session ends naturally
  useSpeechRecognitionEvent("end", () => {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    setRecognizing(false);
    setInterimTranscript("");
  });

  // Update both state (for rendering) and the ref (for race-safe reads in effects)
  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    if (event.isFinal) {
      if (text.trim()) {
        const updated = accumulatedRef.current
          ? `${accumulatedRef.current} ${text}`.trim()
          : text.trim();
        accumulatedRef.current = updated;
        setTranscript(updated);
      }
    } else {
      setInterimTranscript(text.trim());
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("Speech recognition error:", event.error);
    setError(event.error || "Speech recognition error occurred");
    setRecognizing(false);
  });

  const start = async () => {
    try {
      setError(null);

      if (!hasPermission.current) {
        const result =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (result.granted) {
          permissionStatus.current = result.status;
          hasPermission.current = true;
        } else {
          setError(
            "Microphone access was denied. Please go to Settings → Privacy & Security → Microphone and enable access for Zorah.",
          );
          return;
        }
      }

      if (enableSounds && startPlayerStatus.isLoaded) {
        await startPlayer.seekTo(0);
        startPlayer.play();
      }

      setTranscript("");
      setInterimTranscript("");
      accumulatedRef.current = "";

      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
      });

      // Safety net: auto-stop after 20 s in case the OS never fires "end"
      autoStopTimeoutRef.current = setTimeout(() => {
        ExpoSpeechRecognitionModule.stop();
      }, 20_000);
    } catch (err) {
      console.error("Error starting transcription:", err);
      setError("Failed to start voice recognition");
    }
  };

  const stop = async () => {
    try {
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
        autoStopTimeoutRef.current = null;
      }
      ExpoSpeechRecognitionModule.stop();
      if (enableSounds && endPlayerStatus.isLoaded) {
        await endPlayer.seekTo(0);
        endPlayer.play();
      }
    } catch (err) {
      console.error("Error stopping transcription:", err);
      setError("Failed to stop voice recognition");
    }
  };

  const reset = () => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    accumulatedRef.current = "";
  };

  return {
    recognizing,
    transcript,
    interimTranscript,
    fullTranscript:
      transcript + (interimTranscript ? ` ${interimTranscript}` : ""),
    transcriptRef: accumulatedRef,
    error,
    start,
    stop,
    reset,
    permissionStatus: permissionStatus.current,
    hasPermission: hasPermission.current,
    startPlayerStatus,
    endPlayerStatus,
  };
};

export default useVoiceTranscriber;
