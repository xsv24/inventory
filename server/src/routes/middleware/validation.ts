import { NextFunction, Request, RequestHandler, Response } from 'express';
import { validatorContext } from '../validators/requestValidator';
import {
  VALIDATION_STATUS_CODE_MAP,
  ValidationResponseError,
} from '../models/error';

export type ValidRequest<Params, Query, Body> = {
  params: Params;
  query: Query;
  body: Body;
};

export type RequestSchema<Params, Query, Body> = {
  params: Zod.ZodType<Params>;
  query: Zod.ZodType<Query>;
  body: Zod.ZodType<Body>;
};

export type ValidationHandler<Params, Query, Body> = (
  values: ValidRequest<Params, Query, Body>,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export const validationHandler = <
  Params = Zod.ZodUndefined,
  Query = Zod.ZodUndefined,
  Body = Zod.ZodUndefined,
>(
  request: RequestSchema<Params, Query, Body>,
  handler: ValidationHandler<Params, Query, Body>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: Make this a lazy find, by only executing functions upon iteration with a generator
    const validator = validatorContext(req);

    const params = validator.validateUrlParam(request.params);
    if (params?.success === false) {
      return sendValidationError(res, params.error);
    }

    const query = validator.validateQuery(request.query);
    if (query.success === false) {
      return sendValidationError(res, query.error);
    }

    const body = validator.validateBody(request.body);
    if (body.success === false) {
      return sendValidationError(res, body.error);
    }

    const validRequest = {
      params: params.value,
      query: query.value,
      body: body.value,
    };

    return handler(validRequest, req, res, next);
  };
};

export const sendValidationError = (
  res: Response,
  error: ValidationResponseError
): void => {
  const status = VALIDATION_STATUS_CODE_MAP[error.type];

  res.status(status).json({
    error: error.type,
    validationError: error.validationError,
  });
};