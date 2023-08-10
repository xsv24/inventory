import { logger } from '@skutopia/logger';
import { Request, Response } from 'express';
import { ValidationErrorType, ValidationResponseError } from '../models/error';

export type ValidatorContext = {
  validateQuery: <T>(
    schema: Zod.ZodType<T>
  ) => ValidationResult<T, ValidationResponseError>;
  validateUrlParam: <T>(
    schema: Zod.ZodType<T>
  ) => ValidationResult<T, ValidationResponseError>;
  validateBody: <T>(
    schema: Zod.ZodType<T>
  ) => ValidationResult<T, ValidationResponseError>;
};

export const validatorContext = (req: Request): ValidatorContext => ({
  validateQuery: <T>(schema: Zod.ZodType<T>) =>
    requestValidator({
      error: 'INVALID_QUERY_PARAMETER',
      schema,
      value: req.query,
    }),
  validateUrlParam: <T>(schema: Zod.ZodType<T>) =>
    requestValidator({
      error: 'INVALID_URL_PARAMETER',
      schema,
      value: req.params,
    }),
  validateBody: <T>(schema: Zod.ZodType<T>) =>
    requestValidator({
      error: 'INVALID_REQUEST_BODY',
      schema,
      value: req.body,
    }),
});

type ValidationSuccess<V> = {
  success: true;
  value: V;
};

type ValidationError<E> = {
  success: false;
  error: E;
};

type ValidationResult<V, E> = ValidationSuccess<V> | ValidationError<E>;

type ValidatorOptions<T> = {
  error: ValidationErrorType;
  schema: Zod.ZodType<T>;
  value: unknown;
};

const requestValidator = <T>(
  options: ValidatorOptions<T>
): ValidationResult<T, ValidationResponseError> => {
  const { schema: validator, error, value } = options;
  const result = validator.safeParse(value);

  if (!result.success) {
    logger.error(
      `Request validation error: '${error}, ${result.error.message}'`,
      { error: result.error }
    );
    return {
      success: false,
      error: {
        validationError: result.error,
        type: error,
      },
    };
  }

  return { success: true, value: result.data };
};
