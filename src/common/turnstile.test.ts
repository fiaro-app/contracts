import { describe, expect, it } from 'vitest';
import { TURNSTILE_HEADER, TurnstileTokenSchema } from './turnstile';

describe('Turnstile contracts', () => {
  it('valida tokens válidos no vacíos', () => {
    expect(TurnstileTokenSchema.safeParse('0.abcdef123456').success).toBe(true);
    expect(TurnstileTokenSchema.safeParse('1x00000000000000000000AA').success).toBe(true);
  });

  it('rechaza strings vacíos o tipos no-string', () => {
    expect(TurnstileTokenSchema.safeParse('').success).toBe(false);
    expect(TurnstileTokenSchema.safeParse(null).success).toBe(false);
    expect(TurnstileTokenSchema.safeParse(123).success).toBe(false);
  });

  it('declara la cabecera estándar cf-turnstile-response', () => {
    expect(TURNSTILE_HEADER).toBe('cf-turnstile-response');
  });
});
