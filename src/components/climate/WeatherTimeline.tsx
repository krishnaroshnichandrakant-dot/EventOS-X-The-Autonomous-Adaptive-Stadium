'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useStadium } from '@/store/stadiumStore';

export default function WeatherTimeline() {
  const { state } = useStadium();
  const weather = state.weather;

  if (!weather || !weather.forecast.length) {
    return (
      <motion.div
        className="card p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-48 flex items-center justify-center text-gray-400 text-[13px]">
          Forecast data loading...
        </div>
      </motion.div>
    );
  }

  const data = weather.forecast.map((point) => {
    const date = new Date(point.time);
    return {
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      temp: point.temp,
      rain: point.rainProbability,
      wind: point.windSpeed,
    };
  });

  return (
    <motion.div
      className="card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">Weather Forecast</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">Next 24 hours — temperature & rain probability</p>
        </div>
      </div>

      <div className="h-[200px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="temp"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
              unit="°"
            />
            <YAxis
              yAxisId="rain"
              orientation="right"
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              tickLine={false}
              axisLine={false}
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
              iconSize={8}
            />
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              name="Temperature (°C)"
              stroke="#2563EB"
              strokeWidth={2}
              fill="url(#tempGradient)"
              dot={false}
              activeDot={{ r: 4, stroke: '#2563EB', strokeWidth: 2, fill: 'white' }}
            />
            <Area
              yAxisId="rain"
              type="monotone"
              dataKey="rain"
              name="Rain (%)"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#rainGradient)"
              dot={false}
              activeDot={{ r: 4, stroke: '#F59E0B', strokeWidth: 2, fill: 'white' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
