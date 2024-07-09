"use client"
import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { Button } from "../ui/button"
import { useMounted } from "@/hooks"

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
  const { mounted } = useMounted()

  const themesWithOutSystem = themes.filter((theme) => theme !== "system")

  if (!mounted) return null

  return (
    <div className="bg-brand-fill-dark-soft dark:bg-brand-heading rounded-lg p-1 w-full flex">
      {themesWithOutSystem.map((theme) => {
        const isActive =
          theme === (currentTheme === "system" ? systemTheme : currentTheme)

        return (
          <div
            key={theme}
            onClick={() => setTheme(theme)}
            className={cn(
              "flex-1 p-1 rounded-[6px] flex items-center justify-center cursor-pointer duration-300 capitalize gap-2",
              isActive
                ? "bg-white dark:bg-brand-fill-outermost dark:text-white text-brand-text-dark"
                : "bg-transparent dark:text-brand-dark-text-gray text-brand-text-gray"
            )}
          >
            {theme === "light" ? (
              <Sun
                size={16}
                className={cn(
                  "duration-300",
                  isActive
                    ? "fill-brand-text-dark dark:fill-white"
                    : "bg-transparent"
                )}
              />
            ) : (
              <Moon
                size={16}
                className={cn(
                  "duration-300",
                  isActive
                    ? "fill-brand-text-dark dark:fill-white"
                    : "bg-transparent"
                )}
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
        <Sun size={16} className="duration-300 fill-black dark:fill-white" />
      ) : (
        <Moon size={16} className="duration-300 fill-black dark:fill-white" />
      )}
    </Button>
  )
}

export default ThemeToggle
