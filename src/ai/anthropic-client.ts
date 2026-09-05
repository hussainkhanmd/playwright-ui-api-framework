import Anthropic from '@anthropic-ai/sdk';
import { config } from '../common/config/config.js';
import { rootLogger } from '../common/logger/logger.js';

/**
 * EXPERIMENTAL — env-gated wrapper around the Anthropic SDK.
 *
 * Nothing in `src/ai/` is imported by the core framework (fixtures, page
 * objects, services). It is inert unless `AI_FEATURES_ENABLED=true` and
 * `ANTHROPIC_API_KEY` is set — calling in without both throws a clear error
 * rather than silently no-op'ing.
 *
 * See src/ai/README.md for the rationale and the risk boundary.
 */

const log = rootLogger.child({ scope: 'ai' });

export function isAiEnabled(): boolean {
  return config.ai.enabled && !!config.ai.apiKey;
}

export function assertAiEnabled(): void {
  if (!config.ai.enabled) {
    throw new Error(
      'AI features are disabled. Set AI_FEATURES_ENABLED=true (and ANTHROPIC_API_KEY) to use src/ai/*.',
    );
  }
  if (!config.ai.apiKey) {
    throw new Error('AI_FEATURES_ENABLED=true but ANTHROPIC_API_KEY is not set.');
  }
}

let client: Anthropic | undefined;

export function getAnthropicClient(): Anthropic {
  assertAiEnabled();
  client ??= new Anthropic({ apiKey: config.ai.apiKey });
  return client;
}

export interface CompleteOptions {
  system?: string;
  maxTokens?: number;
}

/** Single-shot text completion. */
export async function completeText(prompt: string, options: CompleteOptions = {}): Promise<string> {
  const { system, maxTokens = 4096 } = options;
  const started = Date.now();

  const message = await getAnthropicClient().messages.create({
    model: config.ai.model,
    max_tokens: maxTokens,
    ...(system ? { system } : {}),
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  log.info(
    { model: config.ai.model, ms: Date.now() - started, inTokens: message.usage.input_tokens },
    'ai completion',
  );
  return text;
}

/** Strip a ```json fence if the model wrapped its answer in one. */
export function unfence(text: string): string {
  const fence = /^```(?:json|ts|typescript)?\s*([\s\S]*?)\s*```$/;
  const match = fence.exec(text.trim());
  return (match?.[1] ?? text).trim();
}
