/**
 * Contratos compartidos de Fiaro: schemas de Zod, tipos y endpoints que usan la API y las apps.
 *
 * Todo lo que se exporta aquí es API pública del paquete: cambiarlo o quitarlo es un cambio
 * incompatible para quien lo consume (ver "Versionado" en el README).
 *
 * @packageDocumentation
 */
export * from './common';
export * from './http';
export * from './i18n';
export * from './system';

export * from './auth';
export * from './tenants';
export * from './subscriptions';
export * from './lenders';
export * from './memberships';
export * from './clients';
export * from './loans';
export * from './collections';
export * from './payments';
export * from './settlements';
export * from './notifications';

export * from './endpoints';
