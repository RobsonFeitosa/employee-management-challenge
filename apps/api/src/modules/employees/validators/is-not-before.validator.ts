import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator'

/**
 * Garante que o valor não seja anterior ao de outra propriedade.
 * Pensado para `YYYY-MM-DD` e `HH:mm`: com zeros à esquerda, a comparação
 * de strings equivale à cronológica. Só compara quando os dois valores
 * casam com `pattern` — formato e obrigatoriedade ficam com os outros
 * validadores, evitando erro duplicado.
 */
export function IsNotBefore(
  property: string,
  pattern: RegExp,
  options?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isNotBefore',
      target: object.constructor,
      propertyName,
      constraints: [property, pattern],
      options,
      validator: {
        validate(value: unknown, args?: ValidationArguments) {
          const other = (args?.object as Record<string, unknown>)[property]
          const comparable = [value, other].every(
            (v) => typeof v === 'string' && pattern.test(v),
          )
          if (!comparable) return true
          return (value as string) >= (other as string)
        },
      },
    })
  }
}
