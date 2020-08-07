import { DefaultEngine } from "../engine.default"
import { FailedValidationResolution } from "../resolution"
import { Resolver, Validator } from "./StringEquals"

const engine = new DefaultEngine({
	NumberEquals: {
		resolver: Resolver,
		validator: Validator,
	},
})

describe(`Should resolve positively`, () => {
	const cases: ReadonlyArray<[string, string]> = [
		[``, ``],
		[` `, ` `],
	]

	test.each(cases)(
		`given %p and %p, it should resolve positively`,
		async (expected, received) => {
			const resolution = await Resolver({ expected, received }, engine)
			expect(resolution.passed).toStrictEqual(true)
		}
	)
})

describe(`Should resolve negatively`, () => {
	const cases: ReadonlyArray<[string, string]> = [[`a`, `A`]]

	test.each(cases)(`given %p and %p, it should return not pass`, async (expected, received) => {
		const resolution = await Resolver({ expected, received }, engine)
		expect(resolution.passed).toStrictEqual(false)
	})
})

describe(`Should fail validation`, () => {
	const cases: ReadonlyArray<[any, any]> = [
		[123, 23],
		[false, ` `],
		[``, 0],
	]

	test.each(cases)(`given %p and %p, it should return %p`, async (expected, received) => {
		const resolution = await Validator({ expected, received }, engine)
		expect(resolution.passed).toStrictEqual(false)
		expect(resolution.passed).toStrictEqual(false)
		expect((resolution as FailedValidationResolution).error).toBeDefined()
		expect((resolution as FailedValidationResolution).error.type).toEqual(`ValidationError`)
		expect((resolution as FailedValidationResolution).error.reasons.length).toBeGreaterThan(0)
	})

	const casesOfArgCount: ReadonlyArray<any> = [{}, { a: `1` }, { a: `1`, b: false, c: `bah` }]

	test.each(casesOfArgCount)(`given %p`, async (props) => {
		const resolution = await Validator(props, engine)
		expect(resolution.passed).toStrictEqual(false)
		expect((resolution as FailedValidationResolution).error).toBeDefined()
		expect((resolution as FailedValidationResolution).error.type).toEqual(`ValidationError`)
		expect((resolution as FailedValidationResolution).error.reasons.length).toBeGreaterThan(0)
	})
})
