import { z } from 'zod';

const text = z.string().min(1);
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
export type Profile = z.infer<typeof profileSchema>;
