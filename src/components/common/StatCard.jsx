import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  onClickTo,
  accent = false,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClickTo) {
      navigate(onClickTo);
    }
  };

  return (
    <div
      className={`card card-hoverable ${onClickTo ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
      style={{
        cursor: onClickTo ? 'pointer' : 'default',
        borderLeft: accent ? '4px solid var(--accent-color)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: accent ? 'var(--color-pistachio-glow)' : 'var(--badge-bg)',
              color: accent ? 'var(--accent-color)' : 'var(--color-pistachio)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '1.85rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
        {trend && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
              background: trendPositive ? 'var(--color-status-success-bg)' : 'var(--color-status-warning-bg)',
              color: trendPositive ? 'var(--color-status-success)' : 'var(--color-status-warning)',
            }}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
