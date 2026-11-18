import React from 'react';

export function ScoreGauge({ score = 0, size = 160, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (safeScore / 100) * circumference;

  let color = '#16a34a'; // green
  let bgColor = '#dcfce7';
  let label = 'Fully Compliant';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (safeScore < 60) {
    color = '#dc2626'; // red
    bgColor = '#fee2e2';
    label = 'Critical Legal Risk';
    badgeColor = 'bg-red-100 text-red-800 border-red-300';
  } else if (safeScore < 85) {
    color = '#d97706'; // amber
    bgColor = '#fef3c7';
    label = 'Action Required';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {safeScore}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            out of 100
          </span>
        </div>
      </div>

      <div className={`mt-3 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
        {label}
      </div>
    </div>
  );
}
