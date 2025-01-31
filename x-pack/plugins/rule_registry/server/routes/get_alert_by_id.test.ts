/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  ALERT_RULE_CONSUMER,
  ALERT_RULE_RISK_SCORE,
  ALERT_STATUS,
  ECS_VERSION,
  ALERT_RULE_TYPE_ID,
  SPACE_IDS,
  TIMESTAMP,
  VERSION,
} from '@kbn/rule-data-utils';

import { BASE_RAC_ALERTS_API_PATH } from '../../common/constants';
import { ParsedTechnicalFields } from '../../common/parse_technical_fields';
import { getAlertByIdRoute } from './get_alert_by_id';
import { requestContextMock } from './__mocks__/request_context';
import { getReadRequest } from './__mocks__/request_responses';
import { requestMock, serverMock } from './__mocks__/server';

const getMockAlert = (): ParsedTechnicalFields => ({
  [TIMESTAMP]: '2021-06-21T21:33:05.713Z',
  [ECS_VERSION]: '1.0.0',
  [VERSION]: '7.13.0',
  [ALERT_RULE_TYPE_ID]: 'apm.error_rate',
  [ALERT_RULE_CONSUMER]: 'apm',
  [ALERT_STATUS]: 'open',
  [ALERT_RULE_RISK_SCORE]: 20,
  [SPACE_IDS]: ['fake-space-id'],
});

describe('getAlertByIdRoute', () => {
  let server: ReturnType<typeof serverMock.create>;
  let { clients, context } = requestContextMock.createTools();

  beforeEach(async () => {
    server = serverMock.create();
    ({ clients, context } = requestContextMock.createTools());

    clients.rac.get.mockResolvedValue(getMockAlert());

    getAlertByIdRoute(server.router);
  });

  test('returns 200 when finding a single alert with valid params', async () => {
    const response = await server.inject(getReadRequest(), context);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(getMockAlert());
  });

  test('returns 200 when finding a single alert with index param', async () => {
    const response = await server.inject(
      requestMock.create({
        method: 'get',
        path: BASE_RAC_ALERTS_API_PATH,
        query: { id: 'alert-1', index: '.alerts-me' },
      }),
      context
    );

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(getMockAlert());
  });

  describe('request validation', () => {
    test('rejects invalid query params', async () => {
      await expect(
        server.inject(
          requestMock.create({
            method: 'get',
            path: BASE_RAC_ALERTS_API_PATH,
            query: { id: 4 },
          }),
          context
        )
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Request was rejected with message: 'Invalid value \\"4\\" supplied to \\"id\\"'"`
      );
    });

    test('rejects unknown query params', async () => {
      await expect(
        server.inject(
          requestMock.create({
            method: 'get',
            path: BASE_RAC_ALERTS_API_PATH,
            query: { notId: 4 },
          }),
          context
        )
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Request was rejected with message: 'Invalid value \\"undefined\\" supplied to \\"id\\"'"`
      );
    });
  });

  test('returns error status if rac client "GET" fails', async () => {
    clients.rac.get.mockRejectedValue(new Error('Unable to get alert'));
    const response = await server.inject(getReadRequest(), context);

    expect(response.status).toEqual(500);
    expect(response.body).toEqual({
      attributes: { success: false },
      message: 'Unable to get alert',
    });
  });
});
