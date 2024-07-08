import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { Button } from "../ui/button"

type ThemeToggleProps = {
  isCollapsed: boolean
}

const ThemeToggle = ({ isCollapsed }: ThemeToggleProps) => {
  if (!isCollapsed) return <ExpandedToggle />

  return <CollapsedToggle />
}

const ExpandedToggle = () => {
  const t = useTranslations("common")
  const { theme: currentTheme, setTheme, themes, systemTheme } = useTheme()

  const themesWithOutSystem = themes.filter((theme) => theme !== "system")

  return (
    <div className="bg-brand-fill-dark-soft rounded-lg p-1 w-full flex">
      {themesWithOutSystem.map((theme) => {
        const isActive = theme === (currentTheme || systemTheme)
        return (
          <div
            key={theme}
            onClick={() => setTheme(theme)}
            className={cn(
              "flex-1 p-1 rounded-[6px] flex items-center justify-center cursor-pointer duration-300 capitalize gap-2",
              isActive ? "bg-white" : "bg-transparent"
            )}
          >
            {theme === "light" ? (
              <Sun
                size={16}
                className="duration-300"
                fill={isActive ? "black" : "transparent"}
              />
            ) : (
              <Moon
                size={16}
                className="duration-300"
                fill={isActive ? "black" : "transparent"}
              />
            )}
            <p className="text-xs">{t(`${theme}` as any)}</p>
          </div>
        )
      })}
    </div>
  )
}

const CollapsedToggle = () => {
  const { theme: currentTheme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className="p-0 border-0 shadow-none bg-transparent"
      onClick={() => setTheme((currentTheme === "light" && "dark") || "light")}
    >
      {currentTheme === "light" ? (
        <Sun size={16} className="duration-300" fill="black" />
      ) : (
        <Moon size={16} className="duration-300" fill="black" />
      )}
    </Button>
  )
}

export default ThemeToggle
