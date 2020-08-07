import { DefaultEngine } from "../engine.default"
import { FailedValidationResolution } from "../resolution"
import { Resolver, Validator } from "./NumberEquals"

const engine = new DefaultEngine({
	NumberEquals: {
		resolver: Resolver,
		validator: Validator,
	},
})

describe(`Should resolve positively`, () => {
	const cases: ReadonlyArray<[number, number]> = [
		[0, 0],
		[0, -0],
		[-0, 0],
		[Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
		[Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
		[20.2131, 20.2131],
		[20, 20.0],
		[20.2131, 20.2131],
		[-12312.82341342423423423, -12312.82341342423423423],
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
	const cases: ReadonlyArray<[number, number]> = [
		[Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
		[20.2131, 20.213101],
		[-12312.8, -12312.0],
	]

	test.each(cases)(`given %p and %p, it should return not pass`, async (expected, received) => {
		const resolution = await Resolver({ expected, received }, engine)
		expect(resolution.passed).toStrictEqual(false)
	})
})

describe(`Should fail validation`, () => {
	const cases: ReadonlyArray<[any, any]> = [
		[`123`, 23],
		[false, true],
		[{}, 0],
	]

	test.each(cases)(`given %p and %p, it should return %p`, async (expected, received) => {
		const resolution = await Validator({ expected, received }, engine)
		expect(resolution.passed).toStrictEqual(false)
		expect((resolution as FailedValidationResolution).error).toBeDefined()
		expect((resolution as FailedValidationResolution).error.type).toEqual(`ValidationError`)
		expect((resolution as FailedValidationResolution).error.reasons.length).toBeGreaterThan(0)
	})

	const casesOfArgCount: ReadonlyArray<any> = [
		null,
		{},
		{ expected: 1 },
		{ expected: 1, received: 1, c: `bah` },
	]

	test.each(casesOfArgCount)(`given %p`, async (props) => {
		const resolution = await Validator(props, engine)
		expect(resolution.passed).toStrictEqual(false)
		expect((resolution as FailedValidationResolution).error).toBeDefined()
		expect((resolution as FailedValidationResolution).error.type).toEqual(`ValidationError`)
		expect((resolution as FailedValidationResolution).error.reasons.length).toBeGreaterThan(0)
	})
})
