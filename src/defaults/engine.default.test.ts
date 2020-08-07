import { UnsuccessfulConditionValidation } from "../model"
import * as Every from "./conditions/Every"
import * as NumberEquals from "./conditions/NumberEquals"
import * as Pass from "./conditions/Pass"
import * as StringEquals from "./conditions/StringEquals"
import { DefaultEngine } from "./engine.default"

const commands = {
	NumberEquals: {
		resolver: NumberEquals.Resolver,
		validator: NumberEquals.Validator,
	},
	StringEquals: {
		resolver: StringEquals.Resolver,
		validator: StringEquals.Validator,
	},
	Every: {
		resolver: Every.Resolver,
		validator: Every.Validator,
	},
	Pass: {
		resolver: Pass.Resolver,
		validator: Pass.Validator,
	},
}

export const engine = new DefaultEngine(commands)

test(`commands must be registered properly`, () => {
	const keys = Object.keys(commands).forEach((key) => {
		expect(engine.get(key as any)).toHaveProperty(`resolver`)
		expect(engine.get(key as any)).toHaveProperty(`validator`)
	})
})

test(`evaluation must not pass with an unknown type`, async () => {
	const evaluation = await engine.evaluate({
		type: `UnknownType`,
		k: `v`,
	})
	expect(evaluation.passed).toStrictEqual(false)
	expect((evaluation as UnsuccessfulConditionValidation).error).toBeDefined()
	expect((evaluation as UnsuccessfulConditionValidation).error.type).toEqual(`UnexpectedError`)
	expect((evaluation as UnsuccessfulConditionValidation).error.message).toEqual(
		`Unknown type "UnknownType"`
	)
})

test(`evaluation must not pass with a known type but lacking validator`, async () => {
	const cmds = {
		NumberEquals: {
			resolver: NumberEquals.Resolver,
			validator: NumberEquals.Validator,
		},
		StringEquals: {
			resolver: StringEquals.Resolver,
			validator: StringEquals.Validator,
		},
		Every: {
			resolver: Every.Resolver,
			validator: Every.Validator,
		},
		Pass: {
			resolver: Pass.Resolver,
		},
	}

	// @ts-expect-error
	const failingEngine = new DefaultEngine(cmds)

	const evaluation = await failingEngine.evaluate({
		type: `Pass`,
		likelihood: 1,
	})
	expect(evaluation.passed).toStrictEqual(false)
	expect((evaluation as UnsuccessfulConditionValidation).error).toBeDefined()
	expect((evaluation as UnsuccessfulConditionValidation).error.type).toEqual(`UnexpectedError`)
	expect((evaluation as UnsuccessfulConditionValidation).error.message).toEqual(
		`Type "Pass" has no validator set`
	)
})

test(`evaluation must not pass with a known type but lacking a resolver`, async () => {
	const cmds = {
		NumberEquals: {
			resolver: NumberEquals.Resolver,
			validator: NumberEquals.Validator,
		},
		StringEquals: {
			resolver: StringEquals.Resolver,
			validator: StringEquals.Validator,
		},
		Every: {
			resolver: Every.Resolver,
			validator: Every.Validator,
		},
		Pass: {
			validator: Pass.Validator,
		},
	}

	// @ts-expect-error
	const failingEngine = new DefaultEngine(cmds)

	const evaluation = await failingEngine.evaluate({
		type: `Pass`,
		likelihood: 1,
	})
	expect(evaluation.passed).toStrictEqual(false)
	expect((evaluation as UnsuccessfulConditionValidation).error).toBeDefined()
	expect((evaluation as UnsuccessfulConditionValidation).error.type).toEqual(`UnexpectedError`)
	expect((evaluation as UnsuccessfulConditionValidation).error.message).toEqual(
		`Type "Pass" has no resolver set`
	)
})
