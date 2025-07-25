import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiSuccessResponse = <TModel extends Type<any>>(
  model?: TModel,
  description = '성공',
) => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: {
        allOf: [
          {
            properties: {
              success: {
                type: 'boolean',
                example: true,
              },
              message: {
                type: 'string',
                example: '요청이 성공적으로 처리되었습니다.',
              },
              data: model
                ? {
                    $ref: getSchemaPath(model),
                  }
                : {
                    type: 'object',
                  },
            },
          },
        ],
      },
    }),
  );
};

export const ApiErrorResponse = (status: number, description: string) => {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: description,
          },
          error: {
            type: 'string',
            example: description,
          },
          statusCode: {
            type: 'number',
            example: status,
          },
          timestamp: {
            type: 'string',
            example: '2024-01-01T00:00:00.000Z',
          },
          path: {
            type: 'string',
            example: '/api/example',
          },
        },
      },
    }),
  );
};

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
  description = '페이지네이션 응답',
) => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      schema: {
        allOf: [
          {
            properties: {
              success: {
                type: 'boolean',
                example: true,
              },
              message: {
                type: 'string',
                example: '요청이 성공적으로 처리되었습니다.',
              },
              data: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                  total: {
                    type: 'number',
                    example: 100,
                  },
                  page: {
                    type: 'number',
                    example: 1,
                  },
                  limit: {
                    type: 'number',
                    example: 10,
                  },
                  totalPages: {
                    type: 'number',
                    example: 10,
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
