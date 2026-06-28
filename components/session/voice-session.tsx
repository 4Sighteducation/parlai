"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { estimateRealtimeCost } from "@/lib/realtime/cost";
import { DEFAULT_SCENARIO } from "@/lib/realtime/tutor-prompt";
import type { TranscriptEntry } from "@/lib/types/database";

type SessionStatus = "idle" | "connecting" | "live" | "saving" | "error";

type VoiceSessionProps = {
  level: string;
  allowOnboarding?: boolean;
};

export function VoiceSession({ level, allowOnboarding }: VoiceSessionProps) {
  const router = useRouter();
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [helpEnglish, setHelpEnglish] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<string | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const inputTokensRef = useRef(0);
  const outputTokensRef = useRef(0);

  const cleanup = useCallback(() => {
    dcRef.current?.close();
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    dcRef.current = null;
    pcRef.current = null;
    streamRef.current = null;
  }, []);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  useEffect(() => {
    if (status !== "live") return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const handleRealtimeEvent = useCallback((payload: string) => {
    try {
      const event = JSON.parse(payload) as {
        type?: string;
        transcript?: string;
        response?: {
          usage?: { input_tokens?: number; output_tokens?: number };
          output?: Array<{
            content?: Array<{ type?: string; transcript?: string; text?: string }>;
          }>;
        };
      };

      if (
        event.type === "conversation.item.input_audio_transcription.completed" &&
        event.transcript
      ) {
        transcriptRef.current.push({ role: "user", text: event.transcript });
      }

      if (event.type === "response.output_audio_transcript.done" && event.transcript) {
        transcriptRef.current.push({ role: "assistant", text: event.transcript });
      }

      if (event.type === "response.done" && event.response?.usage) {
        inputTokensRef.current += event.response.usage.input_tokens ?? 0;
        outputTokensRef.current += event.response.usage.output_tokens ?? 0;
      }
    } catch {
      // Ignore malformed events.
    }
  }, []);

  const startSession = useCallback(async () => {
    setError(null);
    setStatus("connecting");
    setSeconds(0);
    transcriptRef.current = [];
    inputTokensRef.current = 0;
    outputTokensRef.current = 0;
    startedAtRef.current = new Date().toISOString();

    try {
      const tokenResponse = await fetch("/api/realtime-token", { method: "POST" });
      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error ?? "Could not start session");
      }

      const ephemeralKey = tokenData.value as string;
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audio = document.createElement("audio");
      audio.autoplay = true;
      audioRef.current = audio;
      pc.ontrack = (event) => {
        audio.srcObject = event.streams[0] ?? null;
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      dc.addEventListener("message", (message) => {
        if (typeof message.data === "string") {
          handleRealtimeEvent(message.data);
        }
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        throw new Error("WebRTC connection failed");
      }

      await pc.setRemoteDescription({
        type: "answer",
        sdp: await sdpResponse.text(),
      });

      setStatus("live");
    } catch (err) {
      cleanup();
      setStatus("error");
      setError(err instanceof Error ? err.message : "Session failed");
    }
  }, [cleanup, handleRealtimeEvent]);

  const endSession = useCallback(async () => {
    setStatus("saving");
    cleanup();

    const inputTokens = inputTokensRef.current;
    const outputTokens = outputTokensRef.current;
    const estCost = estimateRealtimeCost(inputTokens, outputTokens);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startedAt: startedAtRef.current ?? new Date().toISOString(),
          scenario: DEFAULT_SCENARIO,
          transcript: transcriptRef.current,
          inputTokens,
          outputTokens,
          estCost,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Could not save session");
      }

      const data = await response.json();
      const sessionId = data.id as string;

      router.push(`/debrief/${sessionId}`);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not save session");
    }
  }, [cleanup, router]);

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10">
      <div className="mb-8 flex items-center justify-between text-sm text-stone-500">
        <Link href={allowOnboarding ? "/onboarding" : "/home"}>← Back</Link>
        <span>
          Level {level} · {minutes}:{secs}
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div
          className={`mb-6 h-24 w-24 rounded-full border-4 ${
            status === "live"
              ? "border-emerald-500 animate-pulse"
              : "border-stone-200"
          }`}
          aria-hidden
        />
        <p className="text-lg font-medium text-stone-900">
          {status === "idle" && "Ready to talk"}
          {status === "connecting" && "Connecting…"}
          {status === "live" && "Giulia is listening"}
          {status === "saving" && "Analysing session…"}
          {status === "error" && "Something went wrong"}
        </p>
        <p className="mt-2 max-w-sm text-sm text-stone-600">{DEFAULT_SCENARIO}</p>
      </div>

      <div className="mt-8 space-y-3">
        {status === "idle" || status === "error" ? (
          <button
            type="button"
            onClick={startSession}
            className="w-full rounded-full bg-emerald-800 py-3 text-sm font-medium text-white hover:bg-emerald-900"
          >
            {status === "error" ? "Try again" : "Start conversation"}
          </button>
        ) : null}

        {status === "live" ? (
          <>
            <button
              type="button"
              onClick={() => setHelpEnglish((value) => !value)}
              className="w-full rounded-full border border-stone-300 py-3 text-sm text-stone-700"
            >
              {helpEnglish ? "Back to Italian" : "Help in English"}
            </button>
            <button
              type="button"
              onClick={endSession}
              className="w-full rounded-full bg-stone-900 py-3 text-sm font-medium text-white hover:bg-stone-800"
            >
              End session
            </button>
          </>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
