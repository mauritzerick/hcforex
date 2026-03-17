import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export type Currency = 'IDR' | 'VND' | 'KRW' | 'MYR' | 'JPY' | 'AUD' | 'INR' | 'ARS';

/** Generate ~30 days of balance history ending at currentBalance (deterministic from currency + balance) */
function useBalanceHistory(currency: Currency, currentBalance: number): { date: string; value: number }[] {
  return useMemo(() => {
    const points: { date: string; value: number }[] = [];
    const days = 30;
    const seed = currency.length * 7 + Math.floor(currentBalance % 1000);
    let v = currentBalance * (0.82 + (seed % 18) / 100);
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const daySeed = (d.getTime() + seed) % 100;
      v = v + (currentBalance * 0.002 * (daySeed / 50 - 1)) + (currentBalance * 0.0005 * (i % 3 - 1));
      if (v > currentBalance * 1.02) v = currentBalance * 0.98;
      if (v < currentBalance * 0.75) v = currentBalance * 0.78;
      points.push({
        date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        value: Math.round(v),
      });
    }
    points[points.length - 1].value = currentBalance;
    return points;
  }, [currency, currentBalance]);
}

type Props = { currency: Currency; balance: number };

export function BalanceChart({ currency, balance }: Props) {
  const data = useBalanceHistory(currency, balance);

  return (
    <div className="balance-chart-wrap">
      <p className="balance-chart-label">Balance history · {currency}</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-fill-top)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--chart-fill-bottom)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            dy={4}
          />
          <YAxis
            domain={['auto', 'auto']}
            hide
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'var(--text-muted)' }}
            formatter={(value) => [
              value != null ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(value)) + ' ' + currency : '',
              'Balance',
            ]}
            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
          />
          <ReferenceLine y={balance} stroke="var(--primary)" strokeDasharray="2 2" strokeOpacity={0.6} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#chartGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
