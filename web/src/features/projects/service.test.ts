import { afterEach, expect, it, vi } from 'vitest';
import projects from '../../../../internal/data/projects.json';
import { projectSchema } from './schema';
import { getProject } from './service';

afterEach(() => vi.unstubAllGlobals());

it('accepts the diagram contracts in every bundled project', () => {
  for (const project of projects) {
    expect(projectSchema.safeParse(project).success, project.slug).toBe(true);
  }
});

it.each(['empty stages', 'duplicate stage IDs', 'missing source', 'missing target'])(
  'returns a display error for %s instead of passing invalid data to the diagram',
  async (violation) => {
    const project = structuredClone(projects[0]);
    const diagram = project.diagram;

    switch (violation) {
      case 'empty stages':
        diagram.stages = [];
        break;
      case 'duplicate stage IDs':
        diagram.stages.push({ ...diagram.stages[0] });
        break;
      case 'missing source':
        diagram.connections[0].from = 'missing-stage';
        break;
      case 'missing target':
        diagram.connections[0].to = 'missing-stage';
        break;
    }

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(project)));

    await expect(getProject(project.slug)).resolves.toEqual({
      ok: false,
      error: {
        message: 'This content could not be displayed. Please try again.',
        status: 200,
      },
    });
  },
);
