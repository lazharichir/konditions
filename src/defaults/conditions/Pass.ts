import * as z from "zod"
import { ConditionResolver, ConditionValidator } from "../../model"
import { Resolution, UnexpectedError, ValidationError } from "../resolution"
import { parseWithZodAndBuildResponse } from "../validation/zod"

export interface Props {
	likelihood?: number
}

export const Resolver: ConditionResolver<Resolution, Props> = async (props, engine) => {
	const likelihood = typeof props.likelihood === `number` ? props.likelihood : 1
	if (likelihood === 1) return { passed: true }
	const random = Math.random()
	const passed = likelihood >= random
	return { passed }
}

export const Validator: ConditionValidator<
	Props,
	ValidationError | UnexpectedError,
	Resolution
> = async (props, engine) => {
	return parseWithZodAndBuildResponse(
		z.object({
			likelihood: z.number().min(0).max(1).optional(),
		}),
		props
	)
}
