# Konditions

A simple customizable conditions and rules engine that allows you to evaluate JSON documents describing one or multiple conditions.

Here is a very simple a example:

```ts
// Your own map of conditions (one resolver and one validator for each)
const conditions = {
	StringEquals: {
		resolver: StringEquals.Resolver,
		validator: StringEquals.Validator,
	},
}

// An engine that stores the dictionary of conditions
const engine = new DefaultEngine(conditions)

// And then, you can start evaluating inputs
const firstInput = {
	type: `StringEquals`,
	expected: `something`,
	received: `something`,
}

const firstEvaluation = await engine.evaluate(input)
// firstEvaluation.passed === true

const secondInput = {
	type: `StringEquals`,
	expected: `something`,
	received: `another thing`,
}

const secondEvaluation = await engine.evaluate(input)
// secondEvaluation.passed === false
```

The client using this library should generally create its own Engine along with its own Conditions (i.e. validators and resolvers) since they are really application-specific.

For the sake of illustration, there is a working implementation named `DefaultEngine` in the `src/defaults` folder.

## What for?

**Konditions** was built as a pet project but also to answer my own needs for another project. I wanted to build a Policy-based Access Control with policies defined in JSON objects inspired by [AWS IAM Policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html).

Each policy statement can have a `condition` field in which the user defines several required assessments to pass. I did not like the [format used by AWS](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition.html), so I created `Konditions`.

Please note, this is not _yet_ production-ready nor battle-tested. Pull requests are welcomed!

## Key Concepts

1. `Engine` – the entry point for the clients with an `evaluate` method
2. `Registry` – an object that holds `Condition` as values and their `type` as keys
3. `Resolution` – the final output of an evaluation, with a boolean property `passed`, and some addition properties depending on the result
4. `Condition` – an simple object containing a `resolver` function and a `validator` function
5. `Input Props` – the raw JSON object with a `type` property to allow the `Engine` to evaluate it
6. `Props` – the props expected by the `Resolver` of a given condition `type`
7. `Validator` – takes candidate props for a given condition and ensures it is fully correct in order to return the cast `Props`
8. `Resolver` – takes validated and cast `Props` and returns a `Resolution` after computation

## Workflow

1. Decide on **what condition types you want** to cover
2. Decide on **what output you want** to have (its shape)
3. **Create a resolver and validator for each** condition type with the right output
4. Instantiate an engine with your condition registry (the object)
5. Evaluate some input props
6. Enjoy!

## `And` and `Or`

The `Engine` passes itself by reference to both a condition's validator and resolver. If you want to create condition types that hold children, you can evaluate them directly from your condition's resolver.

Here is an example from the `DefaultEngine`. It is an `Every` (i.e. `And`, `All`) condition which means all the children input props must be evaluated and must pass (if one fails, it fails too).

```ts
export interface Props {
	conditions: any[]
}

export const Resolver: ConditionResolver<Resolution, Props> = async (props, engine) => {
	const results = await Promise.all(props.conditions.map((child) => engine.evaluate(child)))
	const resolution = makeResolution(results.every((val) => val.passed === true))
	resolution.resolutions = results
	return resolution
}
```

And as a test:

```ts
test(`should pass when all conditions are true`, async () => {
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

	const resolution = await Resolver(
		{
			// This array holds all the children conditions
			// all of them must pass
			conditions: [
				{
					// a likelihood of 1 means it will always pass
					// it's a helper condition type for tests,
					// you would obviously use real conditions here
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

	expect(resolution.passed).toStrictEqual(true)
})
```

If any of the `Pass` conditions did not pass, that evaluation would fail. The same can be done for `Some` (i.e. `Or`, `Any`).
