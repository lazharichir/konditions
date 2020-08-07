export interface Resolution {
	passed: boolean
	resolutions?: Resolution[]
}

export interface SuccessfulResolution extends Resolution {
	passed: true
}

export interface UnsuccessfulResolution extends Resolution {
	passed: false
}

export interface FailedResolution<E = any> extends UnsuccessfulResolution {
	passed: false
	error: E
}

export type AnyResolution<E = any> =
	| SuccessfulResolution
	| UnsuccessfulResolution
	| FailedResolution<E>

export type FailedValidationResolution = FailedResolution<ValidationError>

export type UnexpectedError = {
	type: `UnexpectedError`
	message: string
	metadata?: { [key: string]: any }
}

export type ValidationError = {
	type: `ValidationError`
	reasons: Array<ValidationErrorReason>
	metadata?: { [key: string]: any }
}

export type ValidationErrorReason = {
	namespace: string
	message: string
}
