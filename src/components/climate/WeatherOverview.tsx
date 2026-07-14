'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Eye,
  Gauge,
  CloudRain,
  RefreshCw,
} from 'lucide-react';
import { useStadium } from '@/store/stadiumStore';

export default function WeatherOverview() {
  const { state } = useStadium();
  const weather = state.weather;

  if (!weather) {
    return (
      <motion.div
        className="card p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center h-40 text-gray-400 text-[13px]">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Loading weather data...
        </div>
      </motion.div>
    );
  }

  const { current } = weather;

  const weatherIcon = getWeatherEmoji(current.icon);

  const metrics = [
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${current.humidity}%`,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: Wind,
      label: 'Wind',
      value: `${current.windSpeed} km/h`,
      color: 'text-teal-500',
      bg: 'bg-teal-50',
    },
    {
      icon: Sun,
      label: 'UV Index',
      value: `${current.uvIndex}`,
      color: current.uvIndex > 7 ? 'text-red-500' : 'text-amber-500',
      bg: current.uvIndex > 7 ? 'bg-red-50' : 'bg-amber-50',
    },
    {
      icon: CloudRain,
      label: 'Rain',
      value: `${current.rainProbability}%`,
      color: current.rainProbability > 60 ? 'text-red-500' : 'text-blue-500',
      bg: current.rainProbability > 60 ? 'bg-red-50' : 'bg-blue-50',
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: `${current.visibility} km`,
      color: 'text-gray-500',
      bg: 'bg-gray-50',
    },
    {
      icon: Gauge,
      label: 'Pressure',
      value: `${current.pressure} hPa`,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <motion.div
      className="card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">Current Weather</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Updated{' '}
            {new Date(weather.lastUpdated).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Main Temperature */}
      <div className="flex items-center gap-4 mb-5">
        <span className="text-5xl">{weatherIcon}</span>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-gray-900">{current.temp}°</span>
            <span className="text-lg text-gray-400">C</span>
          </div>
          <div className="text-[13px] text-gray-500 capitalize mt-0.5">
            {current.description}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            Feels like {current.feelsLike}°C
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className="p-2.5 rounded-lg bg-gray-50/70"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div
                  className={`flex items-center justify-center w-5 h-5 rounded ${metric.bg}`}
                >
                  <Icon className={`w-3 h-3 ${metric.color}`} />
                </div>
                <span className="text-[10px] text-gray-400">{metric.label}</span>
              </div>
              <div className="text-[14px] font-semibold text-gray-900">{metric.value}</div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function getWeatherEmoji(icon: string): string {
  const map: Record<string, string> = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️',
  };
  return map[icon] || '🌤️';
}
