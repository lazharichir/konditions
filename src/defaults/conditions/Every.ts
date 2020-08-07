import * as z from "zod"
import { ConditionResolver, ConditionValidator } from "../../model"
import { Resolution, UnexpectedError, ValidationError } from "../resolution"
import { makeResolution } from "../resolution.factories"
import { parseWithZodAndBuildResponse } from "../validation/zod"

export interface Props {
	conditions: any[]
}

export const Resolver: ConditionResolver<Resolution, Props> = async (props, engine) => {
	const results = await Promise.all(props.conditions.map((child) => engine.evaluate(child)))
	const resolution = makeResolution(results.every((val) => val.passed === true))
	resolution.resolutions = results
	return resolution
}

export const Validator: ConditionValidator<
	Props,
	ValidationError | UnexpectedError,
	Resolution
> = async (props, engine) => {
	return parseWithZodAndBuildResponse(
		z.object({
			conditions: z
				.array(
					z.object({
						type: z.string(),
					})
				)
				.min(1),
		}),
		props
	)
}
