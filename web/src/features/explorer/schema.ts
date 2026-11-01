import { z } from 'zod';

const text = z.string().min(1);

export const explorerSchema = z.object({
  categories: z.array(z.object({ id: text, label: text })),
  diagramIcons: z.array(text),
  connectionKinds: z.array(z.string()),
});
export type Explorer = z.infer<typeof explorerSchema>;
export type ProjectCategory = Explorer['categories'][number];
