import useColumns from './Columns';
import { renderHook } from '@testing-library/react';

jest.mock('./Cells', () => ({
  SystemNameCell: 'SystemNameCellComponent',
  RedHatLightSpeedCell: 'RedHatLightSpeedCellComponent',
  ExecutionStatusCell: 'ExecutionStatusCellComponent',
}));

jest.mock('@patternfly/react-table', () => ({
  wrappable: 'wrappableTransform',
}));

describe('ExecutionHistoryContent Columns', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getColumns = () => {
    const { result } = renderHook(() => useColumns());
    return result.current;
  };

  it('should return an array of 3 columns', () => {
    const columns = getColumns();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns).toHaveLength(3);
  });

  it('should have System name column with correct configuration', () => {
    const columns = getColumns();
    const systemNameColumn = columns[0];

    expect(systemNameColumn.title).toBe('System name');
    expect(systemNameColumn.transforms).toEqual(['wrappableTransform']);
    expect(systemNameColumn.exportKey).toBe('action');
    expect(systemNameColumn.Component).toBe('SystemNameCellComponent');
  });

  it('should have Red Hat Lightspeed connection column with correct configuration', () => {
    const columns = getColumns();
    const connectionColumn = columns[1];

    expect(connectionColumn.title).toBe('Red Hat Lightspeed connection');
    expect(connectionColumn.transforms).toEqual(['wrappableTransform']);
    expect(connectionColumn.exportKey).toBe('reboot');
    expect(connectionColumn.Component).toBe('RedHatLightSpeedCellComponent');
  });

  it('should have Execution status column with correct configuration', () => {
    const columns = getColumns();
    const executionStatusColumn = columns[2];

    expect(executionStatusColumn.title).toBe('Execution status');
    expect(executionStatusColumn.transforms).toEqual(['wrappableTransform']);
    expect(executionStatusColumn.exportKey).toBe('system_count');
    expect(executionStatusColumn.Component).toBe(
      'ExecutionStatusCellComponent',
    );
  });

  it('should maintain consistent column order', () => {
    const columns = getColumns();
    expect(columns.map((col) => col.title)).toEqual([
      'System name',
      'Red Hat Lightspeed connection',
      'Execution status',
    ]);
  });
});
