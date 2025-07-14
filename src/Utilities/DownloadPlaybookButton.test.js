import { download } from './DownloadPlaybookButton';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/redux',
  () => ({
    addNotification: jest.fn((args) => args),
  }),
);

describe('download notification logic', () => {
  let dispatch;
  beforeEach(() => {
    dispatch = jest.fn();
    addNotification.mockClear();
  });

  it('notifies when nothing is eligible for download (single)', () => {
    const selectedIds = ['a'];
    const data = [{ id: 'a', issue_count: 0 }];
    download(selectedIds, data, dispatch);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Download failed',
        description:
          'There was 1 remediation plan selected, but none are eligible for download.',
        variant: 'danger',
      }),
    );
  });

  it('notifies when nothing is eligible for download (multiple)', () => {
    const selectedIds = ['a', 'b'];
    const data = [
      { id: 'a', issue_count: 0 },
      { id: 'b', issue_count: 0 },
    ];
    download(selectedIds, data, dispatch);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Download failed',
        description:
          'There was 2 remediation plans selected, but none are eligible for download.',
        variant: 'danger',
      }),
    );
  });

  it('notifies when some are eligible for download', () => {
    const selectedIds = ['a', 'b'];
    const data = [
      { id: 'a', issue_count: 1 },
      { id: 'b', issue_count: 0 },
    ];
    download(selectedIds, data, dispatch);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'info',
        title: 'Downloading 1 remediation plan',
        description: '1 empty remediation plan was not downloaded',
      }),
    );
  });

  it('notifies when all are eligible for download (single)', () => {
    const selectedIds = ['a'];
    const data = [{ id: 'a', issue_count: 2 }];
    download(selectedIds, data, dispatch);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Download ready',
        description: 'Your playbook is downloading now.',
        variant: 'success',
      }),
    );
  });

  it('notifies when all are eligible for download (multiple)', () => {
    const selectedIds = ['a', 'b'];
    const data = [
      { id: 'a', issue_count: 1 },
      { id: 'b', issue_count: 2 },
    ];
    download(selectedIds, data, dispatch);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Download ready',
        description: 'Your playbooks are downloading now.',
        variant: 'success',
      }),
    );
  });
});
