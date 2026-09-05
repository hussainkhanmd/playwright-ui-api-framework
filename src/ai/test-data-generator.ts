import { z } from 'zod';
import { completeText, unfence, isAiEnabled } from './anthropic-client.js';

/**
 * EXPERIMENTAL — generate realistic test data that satisfies a zod schema.
 *
 * The schema is the guardrail: the model's output is parsed through it, so a
 * hallucinated shape fails loudly here and never reaches a test. When AI is
 * disabled this throws — deterministic data belongs in `data/factories/`.
 */
export interface GenerateOptions {
  /** Natural-language description of the kind of records wanted. */
  description: string;
  count?: number;
}

export async function generateData<T extends z.ZodTypeAny>(
  schema: T,
  options: GenerateOptions,
): Promise<z.infer<T>[]> {
  if (!isAiEnabled()) {
    throw new Error(
      'generateData needs AI enabled. For deterministic data use the faker factories in data/factories/.',
    );
  }

  const { description, count = 3 } = options;
  const jsonSchema = z.toJSONSchema(schema);

  const prompt = [
    `Generate exactly ${count} realistic test records described as: "${description}".`,
    'Each record MUST validate against this JSON Schema:',
    '```json',
    JSON.stringify(jsonSchema, null, 2),
    '```',
    'Respond with ONLY a JSON array of the records. No prose, no code fence.',
  ].join('\n');

  const raw = unfence(
    await completeText(prompt, {
      system: 'You are a test-data generator. Output strictly valid JSON that matches the schema.',
      maxTokens: 2048,
    }),
  );

  const parsed: unknown = JSON.parse(raw);
  return z.array(schema).parse(parsed);
}
