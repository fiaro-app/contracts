import { describe, expect, it } from 'vitest';
import { systemEndpoints } from './system.endpoints';
import { AppVersionSchema, compareAppVersions, MobileVersionResponseSchema } from './system.schemas';

describe('compareAppVersions', () => {
  it('compara cada parte como número, no como texto', () => {
    expect(compareAppVersions('1.2.0', '1.10.0')).toBeLessThan(0);
    expect(compareAppVersions('2.0.0', '1.9.9')).toBeGreaterThan(0);
    expect(compareAppVersions('1.4.2', '1.4.2')).toBe(0);
  });
});

describe('AppVersionSchema', () => {
  it('exige MAYOR.MENOR.PARCHE', () => {
    expect(AppVersionSchema.safeParse('1.4.0').success).toBe(true);
    expect(AppVersionSchema.safeParse('1.4').success).toBe(false);
    expect(AppVersionSchema.safeParse('v1.4.0').success).toBe(false);
  });
});

describe('systemEndpoints', () => {
  it('define el version-gate que consulta la app al arrancar', () => {
    expect(systemEndpoints.mobileVersion.path).toBe('/mobile/version');
    const body = MobileVersionResponseSchema.parse({
      minimumSupportedVersion: '1.0.0',
      latestVersion: '1.3.0',
      downloadUrl: 'https://example.com/fiaro-1.3.0.apk',
    });
    expect(compareAppVersions('0.9.0', body.minimumSupportedVersion)).toBeLessThan(0);
  });
});
