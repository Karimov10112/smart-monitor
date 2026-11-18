import React from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, Legend } from 'recharts';
import { classifyGlucose } from '../../utils/glucose';
import { GlucoseBadge } from './index';

export interface GlucosePoint {
  date: string;
  fasting: number | null;
  postMeal: number | null;
}

/**
 * Clinical-style glucose trend: target band (3.9–10.0) shaded green, low/high
 * thresholds dashed, every reading coloured by its glucose range.
 */
export function GlucoseTrendChart({ data, fastingLabel, postMealLabel, height = { xs: 260, sm: 320 } }: {
  data: GlucosePoint[];
  fastingLabel: string;
  postMealLabel: string;
  height?: number | { xs: number; sm: number };
}) {
  const theme = useTheme();
  const g = theme.palette.glucose;
  const yMax = Math.max(16, ...data.map(d => Math.max(d.fasting || 0, d.postMeal || 0) + 1));

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 160 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>{label}</Typography>
        <Stack spacing={0.5}>
          {payload.filter((p: any) => p.value != null).map((p: any) => (
            <Stack key={p.dataKey} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                <Typography variant="caption">{p.name}</Typography>
              </Stack>
              <GlucoseBadge value={p.value} showLabel={false} />
            </Stack>
          ))}
        </Stack>
      </Box>
    );
  };

  const GlucoseDot = (props: any) => {
    const { cx, cy, value } = props;
    if (cx == null || cy == null || value == null) return null;
    const level = classifyGlucose(value) || 'inRange';
    return <circle cx={cx} cy={cy} r={3.5} fill={g[level]} stroke={theme.palette.background.paper} strokeWidth={1.5} />;
  };

  return (
    <Box sx={{ height, mx: -1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
          <ReferenceArea y1={3.9} y2={10} fill={g.inRange} fillOpacity={theme.palette.mode === 'dark' ? 0.1 : 0.08} ifOverflow="extendDomain" />
          <ReferenceLine y={3.9} stroke={g.low} strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={10} stroke={g.high} strokeDasharray="4 4" strokeOpacity={0.6} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={24} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
          <YAxis domain={[2, Math.ceil(yMax)]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: theme.palette.divider, strokeWidth: 1 }} />
          <Legend verticalAlign="top" align="right" height={32} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: theme.palette.text.secondary }} />
          <Line type="monotone" dataKey="fasting" name={fastingLabel} stroke={theme.palette.primary.main} strokeWidth={2.25} connectNulls isAnimationActive={false} dot={<GlucoseDot />} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="postMeal" name={postMealLabel} stroke={theme.palette.secondary.main} strokeWidth={2.25} strokeDasharray="6 3" connectNulls isAnimationActive={false} dot={<GlucoseDot />} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}
