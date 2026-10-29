import { z } from 'zod';

const text = z.string().min(1);
export const explorerSchema = z.object({
  categories: z.array(z.object({ id: text, label: text })),
  diagramIcons: z.array(text),
  connectionKinds: z.array(z.string()),
});
export type Explorer = z.infer<typeof explorerSchema>;
export type ProjectCategory = Explorer['categories'][number];
export const profileSchema = z.object({
  name: text,
  headline: text,
  role: text,
  email: text,
  biography: z.array(text),
  focus: z.array(z.object({ label: text, text })),
  education: z.array(z.object({ title: text, organization: text, period: text })),
  portrait: text,
  portraitAlt: text,
  links: z.array(z.object({ label: text, url: text })),
});
export const experienceSchema = z.array(
  z.object({
    id: text,
    role: text,
    organization: text,
    start: text,
    end: text.optional(),
    description: text,
    highlights: z.array(text),
    order: z.number(),
  }),
);
export const summarySchema = z.object({
  slug: text,
  title: text,
  category: text,
  summary: text,
  order: z.number(),
});
export const summariesSchema = z.array(summarySchema);
export const projectSchema = summarySchema.extend({
  technologies: z.array(text),
  source: text,
  repository: text,
  diagram: z.object({
    description: text,
    stages: z.array(z.object({ id: text, label: text, caption: text, icon: text })),
    connections: z.array(
      z.object({ from: text, to: text, label: z.string().optional(), kind: z.string().optional() }),
    ),
  }),
  capabilities: z.array(text),
  organization: text,
  sections: z.array(z.object({ title: text, paragraphs: z.array(text), items: z.array(text) })),
  screenshots: z.array(z.object({ path: text, alt: text, caption: text })),
  note: z.string(),
});
export const certificationsSchema = z.array(
  z.object({
    id: text,
    title: text,
    issuer: text,
    issued: text,
    expiry: text.optional(),
    credentialId: text.optional(),
    url: text,
    description: z.string().optional(),
    order: z.number(),
  }),
);
export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>[number];
export type ProjectSummary = z.infer<typeof summarySchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certification = z.infer<typeof certificationsSchema>[number];
