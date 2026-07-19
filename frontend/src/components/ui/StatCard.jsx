import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title, value, subtitle, icon: Icon, color = 'cyan',
  trend, trendValue, prefix = '', suffix = '', index = 0,
  warn = false,
}) => {
  const isPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 280 }}
      className="card"
      style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600 }}>{title}</span>
        {Icon && (
          <div className={`stat-icon ${warn ? 'warn' : ''}`}>
            <Icon width={17} height={17} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="stat-value">
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
      </div>

      {/* Delta */}
      {(trend || subtitle) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 600,
          color: trend ? (isPositive ? 'var(--cyan-dark)' : 'var(--neg)') : 'var(--ink-faint)',
        }}>
          {trend && (isPositive
            ? <TrendingUp width={13} height={13} />
            : <TrendingDown width={13} height={13} />
          )}
          {trendValue && <span>{trendValue}</span>}
          {subtitle && <span style={{ color: 'var(--ink-faint)', fontWeight: 500 }}>{subtitle}</span>}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
