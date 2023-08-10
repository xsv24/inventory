export type ValidationErrorType =
  | 'INVALID_QUERY_PARAMETER'
  | 'INVALID_URL_PARAMETER'
  | 'INVALID_REQUEST_BODY'
  | 'NOT_FOUND';

export type ValidationResponseError = {
  type: ValidationErrorType;
  validationError: any;
};

export const VALIDATION_STATUS_CODE_MAP: Record<ValidationErrorType, number> = {
  INVALID_QUERY_PARAMETER: 400,
  INVALID_URL_PARAMETER: 400,
  INVALID_REQUEST_BODY: 400,
  NOT_FOUND: 404,
};
