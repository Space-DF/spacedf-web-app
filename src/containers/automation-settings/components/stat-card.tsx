export function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-4 dark:border-brand-stroke-outermost bg-card">
      {icon}
      <div>
        <p className="text-xs text-brand-text-gray">{label}</p>
        <p className="text-xl font-bold text-brand-component-text-dark dark:text-white">
          {value}
        </p>
      </div>
    </div>
  )
}
