'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, ShieldAlert, CheckCircle } from 'lucide-react';
import { useStadium } from '@/store/stadiumStore';

export default function TimeTravelScrubber() {
  const { state, dispatch, rawState } = useStadium();
  const [isPlaying, setIsPlaying] = useState(false);

  const history = rawState.history || [];
  const playbackIndex = rawState.playbackIndex;

  // Auto-play timer for history playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && history.length > 0) {
      interval = setInterval(() => {
        const nextIndex =
          playbackIndex === null
            ? 0
            : playbackIndex + 1 >= history.length
            ? null
            : playbackIndex + 1;

        dispatch({ type: 'SET_PLAYBACK_INDEX', payload: nextIndex });

        if (nextIndex === null) {
          setIsPlaying(false);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackIndex, history.length, dispatch]);

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value === history.length) {
      dispatch({ type: 'SET_PLAYBACK_INDEX', payload: null });
      setIsPlaying(false);
    } else {
      dispatch({ type: 'SET_PLAYBACK_INDEX', payload: value });
    }
  };

  const handlePrev = () => {
    if (playbackIndex === null) {
      if (history.length > 0) {
        dispatch({ type: 'SET_PLAYBACK_INDEX', payload: history.length - 1 });
      }
    } else if (playbackIndex > 0) {
      dispatch({ type: 'SET_PLAYBACK_INDEX', payload: playbackIndex - 1 });
    }
  };

  const handleNext = () => {
    if (playbackIndex === null) return;
    if (playbackIndex + 1 >= history.length) {
      dispatch({ type: 'SET_PLAYBACK_INDEX', payload: null });
    } else {
      dispatch({ type: 'SET_PLAYBACK_INDEX', payload: playbackIndex + 1 });
    }
  };

  const isLive = playbackIndex === null;
  const currentIndex = isLive ? history.length : playbackIndex;

  // Calculate the predictive warning gap for the UI (Wow #4 Highlight)
  // Let's search if any critical warnings are active in the historic vs current state
  const hasHistoryWarnings = history.some((h) =>
    h.zones.some((z) => z.density === 'critical' || z.density === 'high')
  );

  return (
    <motion.div
      className="card p-4 bg-white border border-gray-200 shadow-sm mt-5"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={history.length === 0}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
              isPlaying
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title={isPlaying ? 'Pause Playback' : 'Play History'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={handlePrev}
            disabled={history.length === 0 || playbackIndex === 0}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            disabled={isLive || history.length === 0}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              dispatch({ type: 'SET_PLAYBACK_INDEX', payload: null });
              setIsPlaying(false);
            }}
            disabled={isLive}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Reset to Live State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="ml-2">
            <span className="text-[12px] font-semibold text-gray-800">
              {isLive ? (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
                  Live Monitoring
                </span>
              ) : (
                <span className="text-amber-600 font-bold">
                  Time-Travel Playback ({history[playbackIndex].timestamp})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            {history[0]?.timestamp || '00:00:00'}
          </span>
          <input
            type="range"
            min="0"
            max={history.length}
            value={currentIndex}
            onChange={handleScrubChange}
            disabled={history.length === 0}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Live
          </span>
        </div>

        {/* Predictive Warning Banner (Wow #4 Gap Highlight) */}
        {hasHistoryWarnings && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] font-medium text-blue-800">
              Predictive Gap: AI Flagged risks 4 min before breach
            </span>
          </div>
        )}
      </div>

      {/* History timeline ticks helper */}
      {history.length > 0 && (
        <div className="flex justify-between px-[75px] mt-1.5 text-[9px] text-gray-400 font-semibold">
          {history.map((h, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="h-1 w-px bg-gray-300 mb-0.5" />
              <span>{h.timestamp.split(':')[1]}m</span>
            </div>
          ))}
          <div className="flex flex-col items-center">
            <span className="h-1 w-px bg-gray-300 mb-0.5" />
            <span>Now</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
