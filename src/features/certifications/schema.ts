import { z } from 'zod';

const text = z.string().min(1);

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
  }),
);
export type Certification = z.infer<typeof certificationsSchema>[number];
