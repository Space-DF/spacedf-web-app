import { PreferencesModeDark, PreferencesModeLight } from '@/components/icons'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

const Appearance = () => {
  const { themes, theme, systemTheme, setTheme } = useTheme()
  const themesWithOutSystem = themes.filter((theme) => theme !== 'system')

  const isLightMode = (theme === 'system' ? systemTheme : theme) === 'light'

  return (
    <div className="animate-opacity-display-effect">
      <RadioGroup
        value={
          themesWithOutSystem?.includes(theme as string) ? theme : systemTheme
        }
      >
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email" className="font-semibold text-brand-text-gray">
            Preferences Mode
          </Label>
          <div className="flex gap-4">
            <div
              className={cn(
                'flex-1 cursor-pointer rounded-xl border p-3 duration-300 hover:border-brand-text-dark dark:bg-brand-heading dark:text-white hover:dark:border-brand-dark-fill-secondary',
                isLightMode
                  ? 'border-brand-dark-fill-secondary'
                  : 'border-transparent hover:scale-105',
              )}
              onClick={() => setTheme('light')}
            >
              <div className="flex items-center justify-center rounded-lg bg-brand-fill-dark-soft px-8 py-6 dark:bg-brand-text-dark">
                <PreferencesModeLight className="fill-[#F0F1F3] dark:fill-[#525D73]" />
              </div>

              <div className="flex gap-2 px-2 pb-2 pt-4">
                <RadioGroupItem value="light" id="r1" />
                <Label
                  htmlFor="r1"
                  className="text-brand-heading-200 dark:text-white"
                >
                  Light mode
                </Label>
              </div>
            </div>
            <div
              className={cn(
                'flex-1 cursor-pointer rounded-xl border p-3 duration-300 dark:bg-brand-heading dark:text-white',
                !isLightMode
                  ? 'border-brand-dark-fill-secondary'
                  : 'border-transparent hover:scale-105 hover:border-black',
              )}
              onClick={() => setTheme('dark')}
            >
              <div className="flex items-center justify-center rounded-lg bg-brand-fill-dark-soft px-8 py-6 dark:bg-brand-text-dark">
                <PreferencesModeDark className="fill-[#C2C6CE] dark:fill-brand-text-dark" />
              </div>

              <div className="flex gap-2 px-2 pb-2 pt-4">
                <RadioGroupItem value="dark" id="r2" />
                <Label
                  htmlFor="r2"
                  className="text-brand-heading-200 dark:text-white"
                >
                  Dark mode
                </Label>
              </div>
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  )
}

export default Appearance
