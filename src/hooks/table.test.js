import { renderHook, act, cleanup } from '@testing-library/react-hooks';
import {
  useExpander,
  useFilter,
  usePagination,
  useSelector,
  useSorter,
} from './table';

// https://github.com/facebook/jest/issues/3465
jest.mock('lodash/debounce', () => (f) => f);

describe('table hooks', () => {
  afterEach(cleanup);

  describe('useFilter', function () {
    test('default', () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.value).toEqual('');
    });

    test('setValue', function () {
      const { result } = renderHook(() => useFilter());

      act(() => result.current.setValue('test'));
      expect(result.current.value).toEqual('test');
    });

    test('onChange', function () {
      const { result } = renderHook(() => useFilter());

      let value1 = false;
      let value2 = false;

      result.current.onChange((value) => (value1 = value));
      result.current.onChange((value) => (value2 = value));

      act(() => result.current.setValue('test'));

      expect(value1).toEqual('test');
      expect(value2).toEqual('test');
    });
  });

  describe('useSorter', function () {
    test('default', () => {
      const { result } = renderHook(() => useSorter());
      expect(result.current.sortBy).toEqual(2);
      expect(result.current.sortDir).toEqual('asc');
    });

    test('override default', () => {
      const { result } = renderHook(() => useSorter(0, 'desc'));
      expect(result.current.sortBy).toEqual(0);
      expect(result.current.sortDir).toEqual('desc');
    });

    test('onSort', () => {
      const { result } = renderHook(() => useSorter());

      act(() => result.current.props.onSort(undefined, 3, 'desc'));

      expect(result.current.sortBy).toEqual(3);
      expect(result.current.sortDir).toEqual('desc');
    });

    test('onChange', () => {
      const { result } = renderHook(() => useSorter());
      let cbArgs = false;
      result.current.onChange((...args) => (cbArgs = args));

      act(() => result.current.props.onSort(undefined, 3, 'desc'));

      expect(cbArgs).toEqual([3, 'desc']);
    });
  });

  describe('useExpander', function () {
    test('default', () => {
      const rows = [{ id: 5 }];
      const { result } = renderHook(() => useExpander());
      expect(result.current.value).toEqual(false);
      result.current.register(rows);
      expect(rows[0].isOpen).toBeUndefined();
    });

    test('expand row', () => {
      const rows = [{ id: 5 }, { id: 6 }];
      const { result } = renderHook(() => useExpander());
      result.current.register(rows);

      act(() => result.current.props.onCollapse(undefined, 1, true));

      expect(result.current.value).toEqual(6);
      result.current.register(rows);
      expect(rows[0].isOpen).toBeUndefined();
      expect(rows[1].isOpen).toEqual(true);
    });

    test('expand and retract row', () => {
      const rows = [{ id: 5 }, { id: 6 }];
      const { result } = renderHook(() => useExpander());
      result.current.register(rows);

      act(() => result.current.props.onCollapse(undefined, 1, true));

      expect(result.current.value).toEqual(6);
      result.current.register(rows);
      expect(rows[0].isOpen).toBeUndefined();
      expect(rows[1].isOpen).toEqual(true);

      act(() => result.current.props.onCollapse(undefined, 1, false));

      const rows2 = [{ id: 5 }, { id: 6 }];
      expect(result.current.value).toEqual(false);
      result.current.register(rows2);
      expect(rows2[0].isOpen).toBeUndefined();
      expect(rows2[1].isOpen).toBeUndefined();
    });

    test('errors if register() not called', () => {
      const { result } = renderHook(() => useExpander());

      expect(() =>
        act(() => result.current.props.onCollapse(undefined, 1, true))
      ).toThrow('register() not called on useExpander()');
    });

    test('errors if row does not define id', () => {
      const rows = [{ id: 5 }, {}];
      const { result } = renderHook(() => useExpander());
      result.current.register(rows);

      expect(() =>
        act(() => result.current.props.onCollapse(undefined, 1, true))
      ).toThrow('row does not define id!');
    });
  });

  describe('usePagination', function () {
    const event = {
      target: {
        tagName: 'BUTTON',
      },
    };

    test('default', () => {
      const { result } = renderHook(() => usePagination());

      expect(result.current.page).toEqual(1);
      expect(result.current.pageSize).toEqual(20);
      expect(result.current.offset).toEqual(0);
    });

    test('onSetPage', () => {
      const { result } = renderHook(() => usePagination());

      act(() => result.current.props.onSetPage(event, 3));

      expect(result.current.page).toEqual(3);
      expect(result.current.pageSize).toEqual(20);
      expect(result.current.offset).toEqual(40);
    });

    test('reset', () => {
      const { result } = renderHook(() => usePagination());

      act(() => result.current.props.onSetPage(event, 3));
      act(() => result.current.reset());

      expect(result.current.page).toEqual(1);
    });

    test('onSetPerPage', () => {
      const { result } = renderHook(() => usePagination());

      act(() => result.current.props.onPerPageSelect(event, 50));
      act(() => result.current.props.onSetPage(event, 3));

      expect(result.current.page).toEqual(3);
      expect(result.current.pageSize).toEqual(50);
      expect(result.current.offset).toEqual(100);
    });

    test('onSetPerPage resets page', () => {
      const { result } = renderHook(() => usePagination());

      act(() => result.current.props.onSetPage(event, 3));
      act(() => result.current.props.onPerPageSelect(event, 50));

      expect(result.current.page).toEqual(1);
      expect(result.current.pageSize).toEqual(50);
    });
  });

  describe('useSelector', function () {
    const rows = [
      {
        id: 5,
      },
      {
        id: 6,
      },
      {
        id: 7,
      },
    ];

    test('default', () => {
      const { result } = renderHook(() => useSelector());

      expect(result.current.getSelectedIds()).toEqual([]);
    });

    test('select one', () => {
      const { result } = renderHook(() => useSelector());
      result.current.register(rows);

      act(() => result.current.props.onSelect(undefined, true, 0));

      expect(result.current.getSelectedIds()).toEqual(['5']);
    });

    test('select/unselect multiple', () => {
      const { result } = renderHook(() => useSelector());
      result.current.register(rows);

      act(() => result.current.props.onSelect(undefined, true, 0));
      result.current.register(rows);
      expect(result.current.getSelectedIds()).toEqual(['5']);

      act(() => result.current.props.onSelect(undefined, true, 2));
      result.current.register(rows);
      expect(result.current.getSelectedIds()).toEqual(['5', '7']);

      act(() => result.current.props.onSelect(undefined, false, 2));
      result.current.register(rows);
      expect(result.current.getSelectedIds()).toEqual(['5']);
    });

    test('select/unselect all', () => {
      const { result } = renderHook(() => useSelector());
      result.current.register(rows);

      act(() => result.current.props.onSelect(undefined, true, -1));
      result.current.register(rows);
      expect(result.current.getSelectedIds()).toEqual(['5', '6', '7']);

      act(() => result.current.props.onSelect(undefined, false, -1));
      result.current.register(rows);
      expect(result.current.getSelectedIds()).toEqual([]);
    });

    test('getSelectedIds intersection', () => {
      const { result } = renderHook(() => useSelector());
      result.current.register(rows);

      act(() => result.current.props.onSelect(undefined, true, -1));
      result.current.register(rows);
      expect(result.current.getSelectedIds(['6'])).toEqual(['6']);
    });

    test('errors if register() not called', () => {
      const { result } = renderHook(() => useSelector());

      expect(() =>
        act(() => result.current.props.onSelect(undefined, true, 2))
      ).toThrow('register() not called on useSelector()');
    });
  });
});
