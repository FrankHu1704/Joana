'use client'

import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export function VisitsChart({ data }: { data: { date: string; views: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C24A6B" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#C24A6B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-dourado-claro/30" />
        <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Area type="monotone" dataKey="views" stroke="#C24A6B" fill="url(#colorViews)" strokeWidth={2} name="Visitas" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function CategoryChart({ data }: { data: { name: string; views: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-dourado-claro/30" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="views" fill="#B8933C" radius={[6, 6, 0, 0]} name="Visualizações" />
      </BarChart>
    </ResponsiveContainer>
  )
}
