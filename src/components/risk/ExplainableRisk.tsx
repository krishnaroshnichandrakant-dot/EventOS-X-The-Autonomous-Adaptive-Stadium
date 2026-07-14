'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, HelpCircle } from 'lucide-react';
import { RiskScenario } from '@/types';

export default function ExplainableRisk({ risk }: { risk: RiskScenario }) {
  const colors = [
    'bg-blue-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-emerald-500',
    'bg-indigo-500',
  ];

  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <h4 className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">
            Explainable Risk Attribution
          </h4>
        </div>
        <div className="group relative cursor-help">
          <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
          <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 rounded-lg bg-gray-900 text-white text-[10px] leading-normal shadow-lg z-10">
            Shows the exact quantitative contribution of active variables to the overall risk score.
          </div>
        </div>
      </div>

      {/* Numerical Score */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {risk.riskScore}
        </span>
        <span className="text-[12px] text-gray-400 font-medium">/ 100 Risk Score</span>
      </div>

      {/* Stacked Contribution Bar */}
      <div className="h-3 w-full bg-gray-200 rounded-full flex overflow-hidden mb-4 shadow-inner">
        {risk.breakdown.map((item, index) => {
          const percentage = (item.value / risk.riskScore) * 100;
          return (
            <motion.div
              key={item.label}
              className={`${colors[index % colors.length]} h-full transition-all`}
              style={{ width: `${percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
              title={`${item.label}: +${item.value}`}
            />
          );
        })}
      </div>

      {/* Legend & Breakdown Details */}
      <div className="space-y-2">
        {risk.breakdown.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${colors[index % colors.length]}`} />
              <span className="text-[12px] text-gray-600 font-medium">{item.label}</span>
            </div>
            <span className="text-[12px] font-bold text-gray-700">+{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
