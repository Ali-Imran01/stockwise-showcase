interface BadgeProps {
  children: React.ReactNode
  tone?: 'neutral' | 'green' | 'red' | 'orange' | 'blue'
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  blue: 'bg-blue-50 text-blue-600',
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-tight uppercase ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}
