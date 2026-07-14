'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  ThermometerSun,
  CloudRain,
  Sun,
  Wind,
  AlertTriangle,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useStadium } from '@/store/stadiumStore';
import { generateWeatherAlerts } from '@/lib/riskEngine';
import { AlertSeverity } from '@/types';

const severityConfig: Record<AlertSeverity, { bg: string; border: string; icon: typeof AlertTriangle; iconColor: string }> = {
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    icon: ShieldAlert,
    iconColor: 'text-red-500',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    icon: Info,
    iconColor: 'text-blue-500',
  },
};

const alertIconMap: Record<string, typeof Sun> = {
  'thermometer-sun': ThermometerSun,
  'cloud-rain': CloudRain,
  sun: Sun,
  wind: Wind,
};

export default function WeatherAlerts() {
  const { state } = useStadium();
  const alerts = generateWeatherAlerts(state.weather);

  return (
    <motion.div
      className="card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">Weather Alerts</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Automated advisories based on current conditions
          </p>
        </div>
        {alerts.length > 0 && (
          <span className="badge badge-warning text-[10px]">
            {alerts.length} Active
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="py-8 text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-[13px] text-gray-500 font-medium">No weather alerts</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Conditions are within normal parameters
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const config = severityConfig[alert.severity];
            const IconComponent = alertIconMap[alert.icon] || AlertTriangle;
            const SeverityIcon = config.icon;

            return (
              <motion.div
                key={alert.id}
                className={`p-3.5 rounded-lg border ${config.bg} ${config.border}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-gray-900">
                        {alert.title}
                      </span>
                      <span
                        className={`badge text-[9px] ${
                          alert.severity === 'danger'
                            ? 'badge-danger'
                            : alert.severity === 'warning'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-600 mb-2">{alert.message}</p>
                    <div className="p-2.5 rounded-md bg-white/60">
                      <p className="text-[11px] text-gray-500">
                        <span className="font-semibold text-gray-700">Recommendation: </span>
                        {alert.recommendation}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {alert.affectedZones.map((zone) => (
                        <span
                          key={zone}
                          className="px-2 py-0.5 rounded text-[10px] bg-white/80 text-gray-500 font-medium"
                        >
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
