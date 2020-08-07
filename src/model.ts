/**
 * A basic plain-object type
 */

export type Loosey = { [key: string]: any }

/**
 * Input Props must have a `type`
 */

export type InputProps<P extends Loosey = Loosey> = {
	type: string
} & P

/**
 * Engine – must evaluate an input document (props with condition type) and return a result
 */

export interface Engine<O> {
	evaluate: (props: InputProps) => Promise<O>
}

/**
 * ConditionValidator – verifies that the given props are properly formed
 * and ready to be passed to the resolver. It outputs an object with a
 * `passed` boolean and either `<E>error` on false, or `<P>props` on true.
 */

export type ConditionValidator<P, E, O = any> = (
	props: unknown,
	engine: Engine<O>
) => Promise<ConditionValidation<P, E>>

/**
 * ConditionValidation – is either successful, or unsuccessful.
 */

export type ConditionValidation<P, E> =
	| SuccessfulConditionValidation<P>
	| UnsuccessfulConditionValidation<E>

export type SuccessfulConditionValidation<P> = { passed: true; props: P }
export type UnsuccessfulConditionValidation<E = any> = { passed: false; error: E }

/**
 * ConditionResolver – accepts valid props and resolves to the desired output format
 */

export type ConditionResolver<O, P> = (props: P, engine: Engine<O>) => Promise<O>
