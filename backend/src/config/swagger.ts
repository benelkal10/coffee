import swaggerUi from 'swagger-ui-express';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Virtual Coffee Machine API',
    version: '1.0.0',
    description: 'Interactive API documentation for the Virtual Coffee Machine application',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server',
    },
  ],
  paths: {
    '/api/orders': {
      get: {
        summary: 'Get orders list',
        description: 'Returns all pending orders and the latest 50 completed orders.',
        responses: {
          200: {
            description: 'A list of orders',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Order',
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new coffee order',
        description: 'Places a new coffee order in the queue. Supports standard, boss priority, and delayed preparation.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userName', 'role', 'timeType'],
                properties: {
                  userName: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 50,
                    description: 'Name of the person placing the order. Cannot start with =, +, -, or @.',
                    example: 'Alice',
                  },
                  role: {
                    type: 'string',
                    enum: ['employee', 'boss'],
                    description: 'Role of the person. Boss orders require the boss password.',
                    example: 'employee',
                  },
                  password: {
                    type: 'string',
                    description: 'Password needed only if role is boss (default: coffee_boss).',
                    example: 'coffee_boss',
                  },
                  timeType: {
                    type: 'string',
                    enum: ['now', 'later'],
                    description: 'Preparation timing. If later, delayMinutes is required.',
                    example: 'now',
                  },
                  delayMinutes: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 1440,
                    description: 'Delay in minutes for later orders.',
                    example: 5,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Order successfully created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Order',
                },
              },
            },
          },
          400: {
            description: 'Bad request (validation error)',
          },
        },
      },
    },
    '/api/reports': {
      get: {
        summary: 'Get monthly reports',
        description: 'Returns all orders placed in a specific month and year.',
        parameters: [
          {
            name: 'year',
            in: 'query',
            required: true,
            schema: {
              type: 'integer',
            },
            example: 2026,
          },
          {
            name: 'month',
            in: 'query',
            required: true,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 12,
            },
            example: 7,
          },
        ],
        responses: {
          200: {
            description: 'List of monthly orders',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Order',
                  },
                },
              },
            },
          },
          400: {
            description: 'Missing or invalid parameters',
          },
        },
      },
    },
    '/api/histogram': {
      get: {
        summary: 'Get user orders histogram data',
        description: 'Returns labels (user names) and order counts for the last 30 days, sorted by order counts.',
        responses: {
          200: {
            description: 'Histogram data for user orders',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    labels: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'integer',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Returns the status and current timestamp of the server.',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Order: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '60c72b2f9b1d8b2bad68565a',
          },
          userName: {
            type: 'string',
            example: 'Alice',
          },
          role: {
            type: 'string',
            enum: ['employee', 'boss'],
            example: 'employee',
          },
          timeType: {
            type: 'string',
            enum: ['now', 'later'],
            example: 'now',
          },
          delayMinutes: {
            type: 'integer',
            example: 0,
          },
          priority: {
            type: 'integer',
            example: 0,
          },
          done: {
            type: 'boolean',
            example: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-07-15T11:00:36.000Z',
          },
          completedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-07-15T11:00:41.000Z',
          },
        },
      },
    },
  },
};
