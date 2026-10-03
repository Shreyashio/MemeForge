import { z } from "zod";

export const MemeProjectSchema = z.object({
  name: z.string(),
  ticker: z.string().regex(/^[A-Z]{3,5}$/, "Ticker must be 3-5 uppercase letters"),
  tagline: z.string(),
  theme: z.object({
    primary: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Hex color required"),
    secondary: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Hex color required"),
    background: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Hex color required"),
    mood: z.enum(["dark", "light"]),
  }),
  emoji: z.string(),
  hero: z.object({
    headline: z.string(),
    subtext: z.string(),
    cta: z.string(),
  }),
  features: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .length(3),
  tokenomics: z
    .array(
      z.object({
        label: z.string(),
        percent: z.number(),
      })
    )
    .refine((items) => items.length >= 4 && items.length <= 5, "4-5 items required")
    .refine((items) => {
      const sum = items.reduce((acc, item) => acc + item.percent, 0);
      return Math.abs(sum - 100) < 0.01;
    }, "Tokenomics must sum to 100"),
  roadmap: z
    .array(
      z.object({
        phase: z.string(),
        title: z.string(),
        items: z.array(z.string()),
      })
    )
    .length(3),
  team: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
      })
    )
    .length(3),
  whitepaper: z.object({
    abstract: z.string(),
    problem: z.string(),
    solution: z.string(),
    tokenomics_text: z.string(),
    risks: z.string(),
    conclusion: z.string(),
  }),
  logo_svg: z.string().max(1500),
});

export type MemeProject = z.infer<typeof MemeProjectSchema>;
