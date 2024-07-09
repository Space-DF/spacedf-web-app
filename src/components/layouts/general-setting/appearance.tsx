import { PreferencesModeDark, PreferencesModeLight } from "@/components/icons"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

const Appearance = () => {
  const { themes, theme, systemTheme, setTheme } = useTheme()
  const themesWithOutSystem = themes.filter((theme) => theme !== "system")

  const isLightMode = (theme === "system" ? systemTheme : theme) === "light"

  return (
    <div className="animate-opacity-display-effect">
      <RadioGroup
        value={
          themesWithOutSystem?.includes(theme as string) ? theme : systemTheme
        }
      >
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email" className="text-brand-text-gray">
            Preferences Mode
          </Label>
          <div className="flex gap-5 mt-5 ">
            <div
              className={cn(
                "flex-1 bg-white dark:bg-brand-heading dark:text-white p-3 rounded-xl cursor-pointer duration-300 border hover:border-brand-text-dark hover:dark:border-brand-dark-fill-secondary",
                isLightMode
                  ? "border-brand-text-dark"
                  : " border-transparent hover:scale-105"
              )}
              onClick={() => setTheme("light")}
            >
              <div className="rounded-lg bg-brand-fill-dark-soft dark:bg-brand-text-dark px-8 py-6 flex items-center justify-center">
                <PreferencesModeLight className="fill-[#F0F1F3] dark:fill-[#525D73]" />
              </div>

              <div className="pb-4 pt-6 flex gap-2 pl-2">
                <RadioGroupItem value="light" id="r1" />
                <Label htmlFor="r1" className="dark:text-white">
                  Light mode
                </Label>
              </div>
            </div>

            <div
              className={cn(
                "flex-1 bg-white dark:bg-brand-heading dark:text-white p-3 rounded-xl cursor-pointer duration-300 border",
                !isLightMode
                  ? "border-brand-dark-fill-secondary"
                  : "border-transparent hover:border-black  hover:scale-105"
              )}
              onClick={() => setTheme("dark")}
            >
              <div className="rounded-lg bg-brand-fill-dark-soft dark:bg-brand-text-dark px-8 py-6 flex items-center justify-center">
                <PreferencesModeDark className="fill-[#C2C6CE] dark:fill-brand-text-dark" />
              </div>

              <div className="pb-4 pt-6 flex gap-2 pl-2">
                <RadioGroupItem value="dark" id="r2" />
                <Label htmlFor="r2" className="dark:text-white">
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
