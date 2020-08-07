import { DefaultEngine } from "../engine.default"
import { FailedValidationResolution } from "../resolution"
import { Resolver, Validator } from "./Pass"

const engine = new DefaultEngine({
	NumberEquals: {
		resolver: Resolver,
		validator: Validator,
	},
})

test(`Likelihood of one (or undefined) should ALWAYS pass`, async () => {
	for (let i = 0; i < 20; i++) {
		expect((await Resolver({ likelihood: 1 }, engine)).passed).toStrictEqual(true)
		expect((await Resolver({ likelihood: 1.0 }, engine)).passed).toStrictEqual(true)
		expect((await Resolver({ likelihood: +1 }, engine)).passed).toStrictEqual(true)
	}
	expect((await Resolver({}, engine)).passed).toStrictEqual(true)
	expect((await Resolver({}, engine)).passed).toStrictEqual(true)
	expect((await Resolver({}, engine)).passed).toStrictEqual(true)
})

test(`Likelihood of zero should NEVER pass`, async () => {
	for (let i = 0; i < 20; i++) {
		expect((await Resolver({ likelihood: 0 }, engine)).passed).toStrictEqual(false)
		expect((await Resolver({ likelihood: -0 }, engine)).passed).toStrictEqual(false)
		expect((await Resolver({ likelihood: +0 }, engine)).passed).toStrictEqual(false)
	}
})

test(`Should accept any floating number between 0 and 1`, async () => {
	expect(typeof (await Resolver({ likelihood: 0.0010101 }, engine)).passed).toEqual(`boolean`)
	expect(typeof (await Resolver({ likelihood: 0.1 }, engine)).passed).toEqual(`boolean`)
	expect(typeof (await Resolver({ likelihood: 0.332523465342 }, engine)).passed).toEqual(
		`boolean`
	)
	expect(typeof (await Resolver({ likelihood: 0.6 }, engine)).passed).toEqual(`boolean`)
	expect(typeof (await Resolver({ likelihood: 0.9999999 }, engine)).passed).toEqual(`boolean`)
	expect(typeof (await Resolver({ likelihood: 0.0 }, engine)).passed).toEqual(`boolean`)
	expect(typeof (await Resolver({ likelihood: 1.0 }, engine)).passed).toEqual(`boolean`)
})

describe(`Should fail validation`, () => {
	const cases: ReadonlyArray<any> = [
		`{ likelihood: 0.5 }`,
		{ likelihood: null },
		{ likelihood: -1 },
		{ likelihood: Number.NEGATIVE_INFINITY },
		{ likelihood: Number.POSITIVE_INFINITY },
		{ likelihood: 1.00000000000001 },
		[123, 23],
		null,
		{ a: `1` },
		{ likelihood: `1` },
		{ a: `1`, b: false, c: `bah` },
		[false, ` `],
		[``, 0],
	]

	test.each(cases)(
		`given %p, it should not pass and return a ValidationError`,
		async (document) => {
			const resolution = await Validator(document, engine)
			expect(resolution.passed).toStrictEqual(false)
			expect((resolution as FailedValidationResolution).error).toBeDefined()
			expect((resolution as FailedValidationResolution).error.type).toEqual(`ValidationError`)
			expect((resolution as FailedValidationResolution).error.reasons.length).toBeGreaterThan(
				0
			)
		}
	)
})
