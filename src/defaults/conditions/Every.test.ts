import { DefaultEngine } from "../engine.default"
import { FailedValidationResolution } from "../resolution"
import { Resolver, Validator } from "./Every"
import * as Passs from "./Pass"

const engine = new DefaultEngine({
	Every: {
		resolver: Resolver,
		validator: Validator,
	},
	Pass: {
		resolver: Passs.Resolver,
		validator: Passs.Validator,
	},
})

test(`should pass when all conditions are true`, async () => {
	const resolution = await Resolver(
		{
			conditions: [
				{
					type: `Pass`,
					likelihood: 1,
				},
				{
					type: `Pass`,
					likelihood: 1,
				},
				{
					type: `Pass`,
					likelihood: 1,
				},
				{
					type: `Pass`,
					likelihood: 1,
				},
				{
					type: `Pass`,
					likelihood: 1,
				},
			],
		},
		engine
	)

	expect(resolution.passed).toBeTruthy()
})

test(`should not pass when even one condition is not true`, async () => {
	const resolution = await Resolver(
		{
			conditions: [
				{
					type: `Pass`,
					likelihood: 1,
				},
				{
					type: `Pass`,
					likelihood: 1,
				},
				{
					type: `Pass`,
					likelihood: 1,
				},
				{
					type: `Pass`,
					likelihood: 0,
				},
				{
					type: `Pass`,
					likelihood: 1,
				},
			],
		},
		engine
	)

	expect(resolution.passed).toStrictEqual(false)
})

test(`should not pass when all conditions are false`, async () => {
	const resolution = await Resolver(
		{
			conditions: [
				{
					type: `Pass`,
					likelihood: 0,
				},
				{
					type: `Pass`,
					likelihood: 0,
				},
				{
					type: `Pass`,
					likelihood: 0,
				},
				{
					type: `Pass`,
					likelihood: 0,
				},
				{
					type: `Pass`,
					likelihood: 0,
				},
			],
		},
		engine
	)

	expect(resolution.passed).toStrictEqual(false)
})

test(`should fail validation when there are no conditions (empty array)`, async () => {
	const resolution = await Validator({ conditions: [] }, engine)
	expect(resolution.passed).toStrictEqual(false)
	expect((resolution as FailedValidationResolution).error).toBeDefined()
	expect((resolution as FailedValidationResolution).error.type).toEqual(`ValidationError`)
	expect((resolution as FailedValidationResolution).error.reasons.length).toBeGreaterThan(0)
})

test(`should fail validation when there are no conditions (undefined property)`, async () => {
	const resolution = await Validator({}, engine)
	expect(resolution.passed).toStrictEqual(false)
	expect((resolution as FailedValidationResolution).error).toBeDefined()
	expect((resolution as FailedValidationResolution).error.type).toEqual(`ValidationError`)
	expect((resolution as FailedValidationResolution).error.reasons.length).toBeGreaterThan(0)
})

test(`should fail validation when there are no conditions (null property)`, async () => {
	const resolution = await Validator({ conditions: null }, engine)
	expect(resolution.passed).toStrictEqual(false)
	expect((resolution as FailedValidationResolution).error).toBeDefined()
	expect((resolution as FailedValidationResolution).error.type).toEqual(`ValidationError`)
	expect((resolution as FailedValidationResolution).error.reasons.length).toBeGreaterThan(0)
})

test(`should fail validation when there is one invalid condition (unknown type here)`, async () => {
	const resolution = await Validator(
		{
			conditions: [
				{
					type: `Pass`,
					likelihood: 1,
				},
				{
					type: `Pass`,
					likelihood: 1,
				},
				{
					type: `Pass`,
					likelihood: 1,
				},
				{
					type: `UnknownType`,
					likelihood: 1,
				},
				{
					type: `Pass`,
					likelihood: 1,
				},
			],
		},
		engine
	)

	expect(resolution.passed).toStrictEqual(false)
	expect((resolution as FailedValidationResolution).error).toBeDefined()
	expect((resolution as FailedValidationResolution).error.type).toEqual(`ValidationError`)
	expect((resolution as FailedValidationResolution).error.reasons.length).toBeGreaterThan(0)
	expect((resolution as FailedValidationResolution).error.reasons.length).toBeGreaterThan(0)
})
