/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { useRef } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useHoverActionItems, UseHoverActionItemsProps } from './use_hover_action_items';
import { useDeepEqualSelector } from '../../hooks/use_selector';
import { DataProvider } from '../../../../common/types/timeline';

jest.mock('../../lib/kibana');
jest.mock('../../hooks/use_selector');
jest.mock('../../containers/sourcerer', () => ({
  useSourcererScope: jest.fn().mockReturnValue({ browserFields: {} }),
}));

describe('useHoverActionItems', () => {
  const defaultProps: UseHoverActionItemsProps = ({
    dataProvider: [{} as DataProvider],
    defaultFocusedButtonRef: null,
    field: 'signal.rule.name',
    handleHoverActionClicked: jest.fn(),
    isObjectArray: true,
    ownFocus: false,
    showTopN: false,
    stKeyboardEvent: undefined,
    toggleColumn: jest.fn(),
    toggleTopN: jest.fn(),
    values: ['rule name'],
  } as unknown) as UseHoverActionItemsProps;

  beforeEach(() => {
    (useDeepEqualSelector as jest.Mock).mockImplementation((cb) => {
      return cb();
    });
  });
  afterEach(() => {
    (useDeepEqualSelector as jest.Mock).mockClear();
  });

  test('should return allActionItems', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => {
        const defaultFocusedButtonRef = useRef(null);
        const testProps = {
          ...defaultProps,
          defaultFocusedButtonRef,
        };
        return useHoverActionItems(testProps);
      });
      await waitForNextUpdate();

      expect(result.current.allActionItems).toHaveLength(6);
      expect(result.current.allActionItems[0].props['data-test-subj']).toEqual(
        'hover-actions-filter-for'
      );
      expect(result.current.allActionItems[1].props['data-test-subj']).toEqual(
        'hover-actions-filter-out'
      );
      expect(result.current.allActionItems[2].props['data-test-subj']).toEqual(
        'hover-actions-toggle-column'
      );
      expect(result.current.allActionItems[3].props['data-test-subj']).toEqual(
        'hover-actions-add-timeline'
      );
      expect(result.current.allActionItems[4].props['data-test-subj']).toEqual(
        'hover-actions-show-top-n'
      );
      expect(result.current.allActionItems[5].props['data-test-subj']).toEqual(
        'hover-actions-copy-button'
      );
    });
  });

  test('should return overflowActionItems', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => {
        const defaultFocusedButtonRef = useRef(null);
        const testProps = {
          ...defaultProps,
          defaultFocusedButtonRef,
          enableOverflowButton: true,
        };
        return useHoverActionItems(testProps);
      });
      await waitForNextUpdate();

      expect(result.current.overflowActionItems).toHaveLength(3);
      expect(result.current.overflowActionItems[0].props['data-test-subj']).toEqual(
        'hover-actions-filter-for'
      );
      expect(result.current.overflowActionItems[1].props['data-test-subj']).toEqual(
        'hover-actions-filter-out'
      );
      expect(result.current.overflowActionItems[2].props['data-test-subj']).toEqual(
        'more-actions-signal.rule.name'
      );
      expect(result.current.overflowActionItems[2].props.items[0].props['data-test-subj']).toEqual(
        'hover-actions-toggle-column'
      );

      expect(result.current.overflowActionItems[2].props.items[1].props['data-test-subj']).toEqual(
        'hover-actions-add-timeline'
      );
      expect(result.current.overflowActionItems[2].props.items[2].props['data-test-subj']).toEqual(
        'hover-actions-show-top-n'
      );
      expect(result.current.overflowActionItems[2].props.items[3].props['data-test-subj']).toEqual(
        'hover-actions-copy-button'
      );
    });
  });
});
