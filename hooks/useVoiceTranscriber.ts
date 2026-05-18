import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import type { PermissionStatus } from "expo-modules-core";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";

const startSound = require("@/assets/sounds/record-start.wav");
const endSound = require("@/assets/sounds/record-cancel.wav");

// Stop automatically after this many ms of silence following the last result.
const SILENCE_TIMEOUT_MS = 2500;
// Hard upper limit on a single recording session.
const MAX_RECORDING_MS = 20_000;

const useVoiceTranscriber = (enableSounds = true) => {
  const startPlayer = useAudioPlayer(enableSounds ? startSound : undefined);
  const endPlayer = useAudioPlayer(enableSounds ? endSound : undefined);
  const startPlayerStatus = useAudioPlayerStatus(startPlayer);
  const endPlayerStatus = useAudioPlayerStatus(endPlayer);

  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // accumulatedRef — always holds the latest finalized transcript text.
  // Read this (not transcript state) wherever a stale-closure race is a concern.
  const accumulatedRef = useRef("");
  // interimRef — mirrors interimTranscript state so we can rescue it on "end"
  // when the OS fires "end" before emitting a final "result" for the last phrase.
  const interimRef = useRef("");

  const hasPermission = useRef(false);
  const permissionStatus = useRef<PermissionStatus | null>(null);
  const maxRecordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Permission check on mount ───────────────────────────────────────────
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

  // ─── Abort any active session on unmount ─────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimers();
      ExpoSpeechRecognitionModule.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (startPlayerStatus.isLoaded) startPlayer.volume = 0.8;
    if (endPlayerStatus.isLoaded) endPlayer.volume = 0.7;
  }, [startPlayer, startPlayerStatus.isLoaded, endPlayer, endPlayerStatus.isLoaded]);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const clearTimers = () => {
    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      ExpoSpeechRecognitionModule.stop();
    }, SILENCE_TIMEOUT_MS);
  };

  // ─── Speech recognition event listeners ──────────────────────────────────

  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    setError(null);
  });

  useSpeechRecognitionEvent("result", (event) => {
    // Every incoming result (interim or final) means the user is still speaking
    // — reset the silence timer so we don't cut off mid-sentence.
    resetSilenceTimer();

    const text = event.results[0]?.transcript ?? "";

    if (event.isFinal) {
      interimRef.current = "";
      if (text.trim()) {
        const updated = accumulatedRef.current
          ? `${accumulatedRef.current} ${text}`.trim()
          : text.trim();
        accumulatedRef.current = updated;
        setTranscript(updated);
      }
      setInterimTranscript("");
    } else {
      interimRef.current = text.trim();
      setInterimTranscript(text.trim());
    }
  });

  useSpeechRecognitionEvent("end", () => {
    clearTimers();

    // Rescue any interim text the OS didn't finalize before ending the session.
    // This happens when "end" fires before the last "result" with isFinal: true.
    if (interimRef.current) {
      const rescue = interimRef.current;
      const updated = accumulatedRef.current
        ? `${accumulatedRef.current} ${rescue}`.trim()
        : rescue.trim();
      accumulatedRef.current = updated;
      setTranscript(updated);
      interimRef.current = "";
    }

    setRecognizing(false);
    setInterimTranscript("");
  });

  useSpeechRecognitionEvent("error", (event) => {
    // "no-speech" is not a user-facing error — it just means the OS timed out
    // before detecting any audio. Treat it as a silent end so the user can try again.
    if (event.error === "no-speech") {
      clearTimers();
      setRecognizing(false);
      return;
    }
    console.error("Speech recognition error:", event.error);
    setError(event.error || "Speech recognition error occurred");
    clearTimers();
    setRecognizing(false);
  });

  // ─── Public API ──────────────────────────────────────────────────────────

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
      interimRef.current = "";

      // continuous: true — we manage stop timing ourselves via the silence timer.
      // This avoids the OS's aggressive 1–2 s silence detector which cuts off
      // natural pauses mid-sentence on iOS.
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 1,
        continuous: true,
      });

      // Hard cap: stop after MAX_RECORDING_MS regardless of silence detection.
      maxRecordingTimerRef.current = setTimeout(() => {
        ExpoSpeechRecognitionModule.stop();
      }, MAX_RECORDING_MS);
    } catch (err) {
      console.error("Error starting transcription:", err);
      setError("Failed to start voice recognition");
    }
  };

  const stop = async () => {
    try {
      clearTimers();
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
    interimRef.current = "";
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
