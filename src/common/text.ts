import { z } from 'zod';

/** Nombre completo de una persona. */
export const PersonNameSchema = z.string().trim().min(2).max(120);

/** Nombre de un negocio o de una cartera. */
export const BusinessNameSchema = z.string().trim().min(2).max(120);

/** Oficio del cliente ("Vendedora ambulante"). */
export const OccupationSchema = z.string().trim().min(2).max(80);

/** Dirección de residencia o de cobro. */
export const AddressSchema = z.string().trim().min(5).max(200);

/** Texto libre corto: notas de cuadre, motivos de reversión, observaciones. */
export const NoteSchema = z.string().trim().min(1).max(500);
