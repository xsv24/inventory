import { NextFunction, Request, Response } from 'express';
import { validatorContext } from '../../validators/requestValidator';
import {
  VALIDATION_STATUS_CODE_MAP,
  ValidationResponseError,
} from '../../models/error';
import { isNever } from '../../../common/utils';
import { AsyncHandler } from './withAsyncErrorHandling';

export type RequestSchema<Params, Query, Body> = {
  params: Zod.ZodType<Params>;
  query: Zod.ZodType<Query>;
  body: Zod.ZodType<Body>;
};

export type ValidationHandler<Params, Query, Body> = (
  req: Request<Params,any, Body, Query>,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const validationHandler = <
  Params = Zod.ZodUndefined,
  Query = Zod.ZodUndefined,
  Body = Zod.ZodUndefined,
>(
  request: RequestSchema<Params, Query, Body>,
  handler: ValidationHandler<Params, Query, Body>
): AsyncHandler => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    // TODO: type the response ResBody
    return await handler(req as Request<Params, any, Body, Query>, res, next);
  };

export const sendValidationError = (
  res: Response,
  validationError: ValidationResponseError
): void => {
  const status = VALIDATION_STATUS_CODE_MAP[validationError.error];
  if (!status) {
    throw new isNever(
      `Unexpected validation error variant '${validationError.error}'`
    );
  }

  res.status(status).json(validationError);
};
