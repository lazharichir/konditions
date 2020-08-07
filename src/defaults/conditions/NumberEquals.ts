import * as z from "zod"
import { ConditionResolver, ConditionValidator } from "../../model"
import { Resolution, UnexpectedError, ValidationError } from "../resolution"
import { parseWithZodAndBuildResponse } from "../validation/zod"

export interface Props {
	expected: number
	received: number
}

export const Resolver: ConditionResolver<Resolution, Props> = async (props, engine) => {
	return {
		passed: props.expected === props.received,
	}
}

export const Validator: ConditionValidator<
	Props,
	ValidationError | UnexpectedError,
	Resolution
> = async (props, engine) => {
	return parseWithZodAndBuildResponse(
		z.object({
			expected: z.number(),
			received: z.number(),
		}),
		props
	)
}
