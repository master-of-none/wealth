import React from 'react'

interface PieSlice {
  label: string
  value: number
  color: string
}

interface PieChartProps {
  data: PieSlice[]
}

const COLORS = ['#d4af37', '#22c55e', '#3b82f6']

export default function PieChart({ data }: PieChartProps) {
  const vals = data.filter((d) => d.value > 0)

  if (!vals.length) {
    return (
      <div className="text-center py-[30px] px-5 text-[#6b7a91]">
        No data
      </div>
    )
  }

  const total = vals.reduce((s, d) => s + d.value, 0)
  const r = 60
  const cx = 80
  const cy = 80

  let cum = 0
  const paths = vals.map((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI
    const sx = cx + r * Math.cos(cum - Math.PI / 2)
    const sy = cy + r * Math.sin(cum - Math.PI / 2)
    cum += angle
    const ex = cx + r * Math.cos(cum - Math.PI / 2)
    const ey = cy + r * Math.sin(cum - Math.PI / 2)
    const la = angle > Math.PI ? 1 : 0
    const pathD =
      vals.length === 1
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
        : `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${la} 1 ${ex} ${ey} Z`
    return <path key={i} d={pathD} fill={COLORS[i]} opacity="0.85" />
  })

  return (
    <div className="flex items-center gap-5 mt-4">
      <svg width="160" height="160">
        {paths}
        <circle cx={cx} cy={cy} r="35" fill="#141c2e" />
      </svg>
      <div className="flex flex-col gap-1.5">
        {vals.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
            <span className="text-[#6b7a91]">{d.label}</span>
            <span className="font-semibold ml-auto">
              {((d.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
