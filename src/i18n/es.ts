/**
 * Textos en español de los mensajes de validación que escriben los schemas del contrato.
 *
 * Cada schema que escribe su propio mensaje usa la clave de aquí (`contracts.phone.invalid_mobile`)
 * en lugar del texto: el texto se busca según el idioma con {@link contractMessage}. Es el
 * idioma de origen: su forma es la que tiene que cumplir cada idioma nuevo.
 */
export const es = {
  contracts: {
    app_version: {
      invalid: 'Versión inválida: usa el formato MAYOR.MENOR.PARCHE.',
    },
    date: {
      invalid: 'Fecha inválida: usa el formato AAAA-MM-DD.',
    },
    date_range: {
      end_before_start: 'La fecha final debe ser igual o posterior a la inicial.',
      too_long: 'El rango de fechas es más largo de lo que permite esta consulta.',
      in_future: 'Las fechas no pueden ser posteriores a hoy.',
    },
    id: {
      invalid: 'Identificador inválido.',
    },
    money: {
      not_integer: 'El valor debe ser un número entero de pesos.',
      negative: 'El valor no puede ser negativo.',
      too_high: 'El valor es demasiado alto.',
      not_positive: 'Ingresa un valor mayor a $0.',
    },
    national_id: {
      invalid: 'Ingresa una cédula válida: solo números, sin puntos.',
    },
    phone: {
      invalid: 'Ingresa un número colombiano válido de 10 dígitos.',
      invalid_mobile: 'Ingresa un celular colombiano válido de 10 dígitos.',
    },
    timestamp: {
      invalid: 'Fecha y hora inválidas.',
    },
  },
} as const;
