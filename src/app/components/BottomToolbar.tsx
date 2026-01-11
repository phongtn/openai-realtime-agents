import React from "react";
import { SessionStatus } from "@/app/types";

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isPTTActive: boolean;
  setIsPTTActive: (val: boolean) => void;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
  isEventsPaneExpanded: boolean;
  setIsEventsPaneExpanded: (val: boolean) => void;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (val: boolean) => void;
  codec: string;
  onCodecChange: (newCodec: string) => void;
}

function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isPTTActive,
  setIsPTTActive,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  isEventsPaneExpanded,
  setIsEventsPaneExpanded,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
  codec,
  onCodecChange,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === "CONNECTED";
  const isConnecting = sessionStatus === "CONNECTING";

  const handleCodecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCodec = e.target.value;
    onCodecChange(newCodec);
  };

  function getConnectionButtonLabel() {
    if (isConnected) return "Disconnect";
    if (isConnecting) return "Connecting...";
    return "Connect";
  }

  function getConnectionButtonClasses() {
    const baseClasses = "text-white text-base p-3 md:p-2 w-full md:w-36 rounded-md min-h-[48px] md:min-h-0 font-medium";
    const cursorClass = isConnecting ? "cursor-not-allowed" : "cursor-pointer";

    if (isConnected) {
      return `bg-red-600 hover:bg-red-700 ${cursorClass} ${baseClasses}`;
    }
    return `bg-black hover:bg-gray-900 ${cursorClass} ${baseClasses}`;
  }

  return (
    <div className="p-3 md:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 md:gap-x-8 safe-area-bottom border-t border-gray-200 bg-white md:bg-transparent">
      {/* Primary row - Connect button */}
      <button
        onClick={onToggleConnection}
        className={getConnectionButtonClasses()}
        disabled={isConnecting}
      >
        {getConnectionButtonLabel()}
      </button>

      {/* Secondary controls - wrap on mobile */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-x-6">
        {/* Push to Talk */}
        <div className="flex flex-row items-center gap-2">
          <input
            id="push-to-talk"
            type="checkbox"
            checked={isPTTActive}
            onChange={(e) => setIsPTTActive(e.target.checked)}
            disabled={!isConnected}
            className="w-5 h-5 md:w-4 md:h-4"
          />
          <label
            htmlFor="push-to-talk"
            className="flex items-center cursor-pointer text-sm md:text-base"
          >
            Push to talk
          </label>
          <button
            onMouseDown={handleTalkButtonDown}
            onMouseUp={handleTalkButtonUp}
            onTouchStart={handleTalkButtonDown}
            onTouchEnd={handleTalkButtonUp}
            disabled={!isPTTActive}
            className={
              (isPTTUserSpeaking ? "bg-gray-300" : "bg-gray-200") +
              " py-2 px-5 md:py-1 md:px-4 cursor-pointer rounded-md min-h-[44px] md:min-h-0" +
              (!isPTTActive ? " bg-gray-100 text-gray-400" : "")
            }
          >
            Talk
          </button>
        </div>

        {/* Audio playback */}
        <div className="flex flex-row items-center gap-2">
          <input
            id="audio-playback"
            type="checkbox"
            checked={isAudioPlaybackEnabled}
            onChange={(e) => setIsAudioPlaybackEnabled(e.target.checked)}
            disabled={!isConnected}
            className="w-5 h-5 md:w-4 md:h-4"
          />
          <label
            htmlFor="audio-playback"
            className="flex items-center cursor-pointer text-sm md:text-base"
          >
            Audio
          </label>
        </div>

        {/* Logs toggle */}
        <div className="flex flex-row items-center gap-2">
          <input
            id="logs"
            type="checkbox"
            checked={isEventsPaneExpanded}
            onChange={(e) => setIsEventsPaneExpanded(e.target.checked)}
            className="w-5 h-5 md:w-4 md:h-4"
          />
          <label htmlFor="logs" className="flex items-center cursor-pointer text-sm md:text-base">
            Logs
          </label>
        </div>

        {/* Codec selector - hidden on mobile, shown in expandable section on larger screens */}
        <div className="hidden md:flex flex-row items-center gap-2">
          <div className="text-sm">Codec:</div>
          <select
            id="codec-select"
            value={codec}
            onChange={handleCodecChange}
            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none cursor-pointer text-sm"
          >
            <option value="opus">Opus (48 kHz)</option>
            <option value="pcmu">PCMU (8 kHz)</option>
            <option value="pcma">PCMA (8 kHz)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default BottomToolbar;
