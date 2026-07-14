'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useStadium } from '@/store/stadiumStore';
import { buildSystemPrompt } from '@/lib/gemini';
import { RiskLevel } from '@/types';
import ExplainableRisk from './ExplainableRisk';

export default function RiskDetailModal() {
  const { state, dispatch } = useStadium();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const risk = state.risks.find((r) => r.id === state.selectedRiskId);

  const close = () => {
    dispatch({ type: 'SELECT_RISK', payload: null });
    setAiAnalysis(null);
  };

  const generateAnalysis = async () => {
    if (!risk) return;
    setLoading(true);
    try {
      const systemPrompt = buildSystemPrompt(state);
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze this risk scenario in detail and provide a comprehensive action plan: "${risk.name}". Current probability: ${risk.probability}%. Impact: ${risk.impact}. Affected zones: ${risk.affectedZones.join(', ')}. Explain why this is happening and what specific steps should be taken right now.`,
          systemPrompt,
          history: [],
        }),
      });
      const data = await response.json();
      setAiAnalysis(data.response);
    } catch {
      setAiAnalysis('Unable to generate analysis at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const riskColors: Record<RiskLevel, string> = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#F97316',
    critical: '#EF4444',
  };

  return (
    <AnimatePresence>
      {risk && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* Modal */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: riskColors[risk.riskLevel] }}
                    />
                    <span className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: riskColors[risk.riskLevel] }}
                    >
                      {risk.riskLevel} Risk
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{risk.name}</h2>
                </div>
                <button
                  onClick={close}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Explainable Risk Score Breakdown */}
              <div className="mb-6">
                <ExplainableRisk risk={risk} />
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Scenario Description
                </h4>
                <p className="text-[13px] text-gray-700 leading-relaxed">{risk.description}</p>
              </div>

              {/* Impact */}
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h4 className="text-[12px] font-semibold text-red-700 uppercase tracking-wider">
                    Likely Impact
                  </h4>
                </div>
                <p className="text-[13px] text-red-800 leading-relaxed">{risk.impact}</p>
              </div>

              {/* Recommended Actions */}
              <div className="mb-6">
                <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Recommended Actions
                </h4>
                <div className="space-y-2">
                  {risk.recommendedActions.map((action, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-[13px] text-gray-700">{action}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Affected Zones */}
              <div className="mb-6">
                <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Affected Zones
                </h4>
                <div className="flex flex-wrap gap-2">
                  {risk.affectedZones.map((zone) => (
                    <span
                      key={zone}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-[12px] text-gray-600 font-medium"
                    >
                      {zone}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trigger Conditions */}
              <div className="mb-6">
                <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Trigger Conditions
                </h4>
                <div className="space-y-1.5">
                  {risk.triggerConditions.map((cond, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px] text-gray-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                      {cond}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              <div className="border-t border-gray-100 pt-6">
                {!aiAnalysis && !loading && (
                  <button
                    onClick={generateAnalysis}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[13px] font-semibold hover:from-blue-700 hover:to-blue-800 transition-all cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate AI Analysis
                  </button>
                )}

                {loading && (
                  <div className="flex items-center justify-center gap-2 py-4 text-[13px] text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing scenario with AI...
                  </div>
                )}

                {aiAnalysis && (
                  <motion.div
                    className="p-4 rounded-xl bg-blue-50 border border-blue-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <h4 className="text-[12px] font-semibold text-blue-700 uppercase tracking-wider">
                        AI Analysis
                      </h4>
                    </div>
                    <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {aiAnalysis}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
