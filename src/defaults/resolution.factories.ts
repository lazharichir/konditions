import {
	FailedResolution,
	SuccessfulResolution,
	UnexpectedError,
	UnsuccessfulResolution,
	ValidationError,
	ValidationErrorReason,
} from "./resolution"

export const makeResolution = (passed: boolean): UnsuccessfulResolution | SuccessfulResolution => {
	return passed ? makeSuccessfulResolution() : makeUnuccessfulResolution()
}

export const makeSuccessfulResolution = (): SuccessfulResolution => {
	return {
		passed: true,
	}
}

export const makeUnuccessfulResolution = (): UnsuccessfulResolution => {
	return {
		passed: false,
	}
}

export const makeValidationFailedResolution = (
	reasons: ValidationErrorReason[] = []
): FailedResolution<ValidationError> => {
	return {
		passed: false,
		error: {
			type: `ValidationError`,
			reasons,
		},
	}
}

export const makeUnexpectedFailedResolution = (): FailedResolution<UnexpectedError> => {
	return {
		passed: false,
		error: {
			type: `UnexpectedError`,
			message: `We encountered an unexpected error.`,
		},
	}
}
