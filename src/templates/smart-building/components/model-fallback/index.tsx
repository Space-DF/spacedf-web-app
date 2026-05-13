import { Progress } from '@/components/ui/progress'
import { Html } from '@react-three/drei'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export function ModelFallback() {
  const t = useTranslations('smartBuilding')
  const [value, setValue] = useState(10)

  useEffect(() => {
    const id = window.setInterval(() => {
      setValue((v) => {
        const next = v + 7
        return next >= 90 ? 20 : next
      })
    }, 250)
    return () => window.clearInterval(id)
  }, [])

  return (
    <Html center>
      <div className="w-[240px] rounded-lg bg-black/40 px-4 py-3 text-white shadow-sm ring-1 ring-white/10 backdrop-blur-md">
        <div className="text-sm font-medium opacity-90 text-brand-component-text-gray">
          {t('loading_model')}
        </div>
        <div className="mt-2">
          <Progress
            value={value}
            className="h-2 bg-white/20"
            indicatorStyle={{ backgroundColor: '#D9D9D9' }}
          />
        </div>
      </div>
    </Html>
  )
}
