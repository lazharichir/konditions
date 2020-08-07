import * as z from "zod"
import { ConditionValidation } from "../../model"
import { UnexpectedError, ValidationError } from "../resolution"

export const parseInputPropsWithZodAndBuildResponse = (props: unknown) => {
	const schema = z
		.object({
			type: z.string(),
		})
		.nonstrict()
	return parseWithZodAndBuildResponse(schema, props)
}

export const parseWithZodAndBuildResponse = <P, S extends z.ZodTypeAny>(
	schema: S,
	props: unknown
): ConditionValidation<P, ValidationError | UnexpectedError> => {
	try {
		return {
			passed: true,
			props: schema.parse(props),
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				passed: false,
				error: {
					type: `ValidationError`,
					reasons: error.errors.map((e) => ({
						namespace: e.path.join(`/`),
						message: e.message,
					})),
				},
			}
		} else {
			return {
				passed: false,
				error: {
					type: `UnexpectedError`,
					message: `Unexpected problem occured while parsing with Zod (parseWithZodToResolution).`,
					metadata: {
						originalError: error,
					},
				},
			}
		}
	}
}
