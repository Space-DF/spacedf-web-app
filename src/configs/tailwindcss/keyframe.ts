export const keyframes = {
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" },
  },
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" },
  },
  "hide-effect": {
    "0%": { opacity: "1" },
    "50%": { opacity: "0" },
    "100%": { opacity: "0", transform: "translateY(-100%)", display: "none" },
  },
  "display-effect": {
    "0%": { opacity: "0", transform: "translateY(30px)", display: "none" },

    "100%": { opacity: "1", transform: "translateY(0px)" },
  },
  "bounce-slow": {
    "0%, 100%": {
      transform: "translateY(0)",
    },
    "50%": {
      transform: "translateY(-10px)",
    },
  },
}
