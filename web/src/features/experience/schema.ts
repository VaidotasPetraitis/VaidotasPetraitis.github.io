import { z } from 'zod';

const text = z.string().min(1);

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
export type Experience = z.infer<typeof experienceSchema>[number];
