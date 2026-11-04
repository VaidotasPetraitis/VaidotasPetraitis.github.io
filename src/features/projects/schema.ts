import { z } from 'zod';

const text = z.string().min(1);

export const projectSchema = z.object({
  slug: text,
  title: text,
  category: text,
  summary: text,
  technologies: z.array(text),
  source: z.url({ protocol: /^https$/ }),
  playUrl: z.url({ protocol: /^https$/ }).optional(),
  diagram: z
    .object({
      description: text,
      stages: z.array(z.object({ id: text, label: text, caption: text, icon: text })).min(1),
      connections: z.array(
        z.object({
          from: text,
          to: text,
          label: z.string().optional(),
          kind: z.enum(['forward', 'feedback', 'bypass']),
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
  sections: z.array(z.object({ title: text, paragraphs: z.array(text) })),
  screenshots: z.array(z.object({ path: text, alt: text, caption: text })),
  note: z.string(),
});
export type Project = z.infer<typeof projectSchema>;
export type ProjectSummary = Pick<Project, 'slug' | 'title' | 'category'>;
