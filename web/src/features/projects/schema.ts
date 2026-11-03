import { z } from 'zod';

const text = z.string().min(1);

export const summarySchema = z.object({
  slug: text,
  title: text,
  category: text,
  summary: text,
});
export const summariesSchema = z.array(summarySchema);
export const projectSchema = summarySchema.extend({
  technologies: z.array(text),
  source: text,
  repository: text,
  diagram: z
    .object({
      description: text,
      stages: z.array(z.object({ id: text, label: text, caption: text, icon: text })).min(1),
      connections: z.array(
        z.object({
          from: text,
          to: text,
          label: z.string().optional(),
          kind: z.string().optional(),
        }),
      ),
    })
    .refine(
      (diagram) => new Set(diagram.stages.map((stage) => stage.id)).size === diagram.stages.length,
      {
        message: 'Diagram stage IDs must be unique.',
        path: ['stages'],
      },
    )
    .refine(
      (diagram) => {
        const stageIds = new Set(diagram.stages.map((stage) => stage.id));

        return diagram.connections.every(
          (connection) => stageIds.has(connection.from) && stageIds.has(connection.to),
        );
      },
      { message: 'Diagram connections must reference existing stages.', path: ['connections'] },
    ),
  capabilities: z.array(text),
  organization: text,
  sections: z.array(z.object({ title: text, paragraphs: z.array(text), items: z.array(text) })),
  screenshots: z.array(z.object({ path: text, alt: text, caption: text })),
  note: z.string(),
});
export type ProjectSummary = z.infer<typeof summarySchema>;
export type Project = z.infer<typeof projectSchema>;
