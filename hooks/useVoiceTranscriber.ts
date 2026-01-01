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

  const hasPermission = useRef(false);
  const permissionStatus = useRef<PermissionStatus | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
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
    requestPermission();
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

  // Speech recognition event handlers
  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    setError(null);
  });

  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    setInterimTranscript("");
  });

  useSpeechRecognitionEvent("result", (event) => {
    const results = event.results;
    let finalText = "";
    let interimText = "";

      const result = results[0];
      if (event.isFinal) {
        finalText += result.transcript + "";
      } else {
        interimText += result.transcript + "";
        console.log('interimText', interimText)
      }
    

    if (finalText.trim()) {
      setTranscript((prev) => (prev + " " + finalText).trim());
    }

    setInterimTranscript(interimText.trim());
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("Speech recognition error:", event.error);
    setError(event.error || "Speech recognition error occurred");
    setRecognizing(false);
  });

  const start = async () => {
    try {
      setError(null);
      
      // Check permission first
      if (!hasPermission.current) {
        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (result.granted) {
          permissionStatus.current = result.status;
          hasPermission.current = true;
        } else {
          setError("Microphone permission denied");
          return;
        }
      }

      if (enableSounds && startPlayerStatus.isLoaded) {
        await startPlayer.seekTo(0);
        startPlayer.play();
      }

      setTranscript("");
      setInterimTranscript("");

      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 1,
        continuous: true,
      });
    } catch (err) {
      console.error("Error starting transcription:", err);
      setError("Failed to start voice recognition");
    }
  };

  const stop = async () => {
    try {
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
  };

  return {
    recognizing,
    transcript,
    interimTranscript,
    fullTranscript: transcript + (interimTranscript ? " " + interimTranscript : ""),
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