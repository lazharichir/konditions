import { ConditionResolver, ConditionValidator, Engine, InputProps } from "../model"
import { AnyResolution } from "./resolution"
import { parseInputPropsWithZodAndBuildResponse } from "./validation/zod"

export type EngineRegistry<P = any, E = any, O = any> = {
	[key: string]: {
		resolver: ConditionResolver<O, P>
		validator: ConditionValidator<P, E, O>
	}
}

export class DefaultEngine<R extends EngineRegistry> implements Engine<AnyResolution> {
	constructor(private commands: R) {}

	async evaluate(props: InputProps): Promise<AnyResolution> {
		// First, let's make sure the input document is valid
		// i.e. it must be a plain object having a `type` property with a string value
		const inputPropValidation = parseInputPropsWithZodAndBuildResponse(props)
		if (!inputPropValidation.passed) return { passed: false, error: inputPropValidation.error }

		// Then, let's validate the props for this specific type
		const { type, ...rest } = inputPropValidation.props as any

		// Do we even accept and handle this type?
		const condition = this.commands[type]
		if (!condition)
			return {
				passed: false,
				error: { type: `UnexpectedError`, message: `Unknown type "${type}"` },
			}

		if (!condition.validator || typeof condition.validator !== `function`)
			return {
				passed: false,
				error: { type: `UnexpectedError`, message: `Type "${type}" has no validator set` },
			}

		if (!condition.resolver || typeof condition.resolver !== `function`)
			return {
				passed: false,
				error: { type: `UnexpectedError`, message: `Type "${type}" has no resolver set` },
			}

		// Validate the extracted props
		const conditionPropValidation = await condition.validator(rest, this)
		if (!conditionPropValidation.passed)
			return { passed: false, error: conditionPropValidation.error }

		// Return the resolution
		const resolution = await this.commands[props.type].resolver(rest, this)
		return resolution
	}

	get<T extends keyof R>(type: T): R[T] {
		return this.commands[type]
	}
}
