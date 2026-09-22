import { describe, expect, it } from 'vitest';
import * as contracts from './index';

describe('@fiaro-app/contracts', () => {
  it('loads without throwing', () => {
    expect(contracts).toBeDefined();
  });
});
