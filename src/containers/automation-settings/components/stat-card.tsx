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
    <div className="flex items-center gap-4 rounded-xl border border-border p-4 dark:border-brand-stroke-outermost bg-card">
      {icon}
      <div>
        <p className="text-sm font-semibold leading-5 text-brand-text-gray">
          {label}
        </p>
        <p className="text-2xl font-semibold leading-9 text-brand-component-text-dark dark:text-white">
          {value}
        </p>
      </div>
    </div>
  )
}
