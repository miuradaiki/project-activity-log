import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManualTimeEntryForm } from '../ManualTimeEntryForm';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { Project } from '../../../types';

// テスト用のプロジェクトデータ
const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Project 1',
    description: 'Test project 1',
    monthlyCapacity: 0.5,
    isArchived: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'project-2',
    name: 'Project 2',
    description: 'Test project 2',
    monthlyCapacity: 0.3,
    isArchived: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// モックアラート
const mockAlert = jest.fn();
global.alert = mockAlert;

// ManualTimeEntryFormをラップするためのヘルパー
const renderManualTimeEntryForm = (
  props: Partial<Parameters<typeof ManualTimeEntryForm>[0]> = {}
) => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    projects: mockProjects,
  };

  return render(
    <LanguageProvider>
      <ManualTimeEntryForm {...defaultProps} {...props} />
    </LanguageProvider>
  );
};

const getTimeInputByLabel = (label: RegExp) => {
  const elements = screen.getAllByLabelText(label);
  const input = elements.find((el) => el.tagName === 'INPUT');
  if (!input) {
    throw new Error(`Time input for ${label} not found`);
  }
  return input as HTMLInputElement;
};

const getSaveButton = () => screen.getByRole('button', { name: /保存|save/i });

describe('ManualTimeEntryForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    const getItemMock = window.localStorage.getItem as jest.Mock;
    getItemMock.mockImplementation((key: string) =>
      key === 'project_activity_log_language' ? 'en' : null
    );
  });

  afterEach(() => {
    (window.localStorage.getItem as jest.Mock).mockReset();
  });

  describe('バリデーション', () => {
    it('終了時間が開始時間より前の場合、エラーメッセージを表示して保存しない', async () => {
      const onSave = jest.fn();
      renderManualTimeEntryForm({ onSave });

      // プロジェクト選択コンボボックスを見つけてクリック
      const projectSelect = screen.getByRole('combobox');
      await userEvent.click(projectSelect);
      await userEvent.click(screen.getByText('Project 1'));

      // 時間入力欄を見つけて変更
      const timeInputs = screen.getAllByDisplayValue(/^\d{2}:\d{2}$/);
      const startTimeInput = timeInputs[0];
      const endTimeInput = timeInputs[1];

      fireEvent.change(startTimeInput, { target: { value: '10:00' } });
      fireEvent.change(endTimeInput, { target: { value: '09:00' } });

      // 保存ボタンをクリック
      const saveButton = getSaveButton();
      await userEvent.click(saveButton);

      // アラートが表示されることを確認
      expect(mockAlert).toHaveBeenCalledWith(
        '終了時間は開始時間より後である必要があります。'
      );
      expect(onSave).not.toHaveBeenCalled();
    });

    it('同じ時間の場合、エラーメッセージを表示して保存しない', async () => {
      const onSave = jest.fn();
      renderManualTimeEntryForm({ onSave });

      // プロジェクト選択
      const projectSelect = screen.getByRole('combobox');
      await userEvent.click(projectSelect);
      await userEvent.click(screen.getByText('Project 1'));

      // 時間入力欄を見つけて変更（同じ時間でduration=0）
      const timeInputs = screen.getAllByDisplayValue(/^\d{2}:\d{2}$/);
      const startTimeInput = timeInputs[0];
      const endTimeInput = timeInputs[1];

      fireEvent.change(startTimeInput, { target: { value: '10:00' } });
      fireEvent.change(endTimeInput, { target: { value: '10:00' } });

      // 保存ボタンをクリック
      const saveButton = getSaveButton();
      await userEvent.click(saveButton);

      // アラートが表示されることを確認（duration <= 0の場合のメッセージ）
      expect(mockAlert).toHaveBeenCalledWith(
        '終了時間は開始時間より後である必要があります。'
      );
      expect(onSave).not.toHaveBeenCalled();
    });

    it('1分未満の時間エントリの場合、エラーメッセージを表示して保存しない', async () => {
      const onSave = jest.fn();

      renderManualTimeEntryForm({ onSave });

      // プロジェクト選択
      const projectSelect = screen.getByRole('combobox');
      await userEvent.click(projectSelect);
      await userEvent.click(screen.getByText('Project 1'));

      const startTimeInput = getTimeInputByLabel(/Start Time/i);
      const endTimeInput = getTimeInputByLabel(/End Time/i);

      fireEvent.change(startTimeInput, { target: { value: '10:00:00' } });
      fireEvent.change(endTimeInput, { target: { value: '10:00:30' } });

      const saveButton = getSaveButton();
      await userEvent.click(saveButton);

      expect(mockAlert).toHaveBeenCalledWith(
        '1分未満の時間エントリは保存できません。'
      );
      expect(onSave).not.toHaveBeenCalled();
    });

    it('正常な時間エントリの場合、保存される', async () => {
      const onSave = jest.fn();
      const onClose = jest.fn();
      renderManualTimeEntryForm({ onSave, onClose });

      // プロジェクト選択
      const projectSelect = screen.getByRole('combobox');
      await userEvent.click(projectSelect);
      await userEvent.click(screen.getByText('Project 1'));

      // 時間入力欄を見つけて変更（2時間の差）
      const timeInputs = screen.getAllByDisplayValue(/^\d{2}:\d{2}$/);
      const startTimeInput = timeInputs[0];
      const endTimeInput = timeInputs[1];

      fireEvent.change(startTimeInput, { target: { value: '10:00' } });
      fireEvent.change(endTimeInput, { target: { value: '12:00' } });

      // 説明を入力
      const descriptionInput = screen.getByRole('textbox');
      await userEvent.type(descriptionInput, 'Test description');

      // 保存ボタンをクリック
      const saveButton = getSaveButton();
      await userEvent.click(saveButton);

      // onSaveが正しい引数で呼ばれることを確認
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'project-1',
          description: 'Test description',
        })
      );

      expect(onClose).toHaveBeenCalled();
      expect(mockAlert).not.toHaveBeenCalled();
    });

    it('日跨ぎエントリは自動的に分割されて保存される', async () => {
      const onSave = jest.fn();
      renderManualTimeEntryForm({ onSave });

      const projectSelect = screen.getByRole('combobox');
      await userEvent.click(projectSelect);
      await userEvent.click(screen.getByText('Project 1'));

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const startTimeInput = getTimeInputByLabel(/Start Time/i);
      const endTimeInput = getTimeInputByLabel(/End Time/i);

      fireEvent.change(startDateInput, { target: { value: '2025-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2025-01-02' } });
      fireEvent.change(startTimeInput, { target: { value: '22:00' } });
      fireEvent.change(endTimeInput, { target: { value: '02:00' } });

      const saveButton = getSaveButton();
      await userEvent.click(saveButton);

      expect(onSave).toHaveBeenCalledTimes(2);
      expect(onSave.mock.calls[1][0].description).toContain('2日目');
    });

    it('24時間を超える場合は確認ダイアログの結果によって保存が制御される', async () => {
      const onSave = jest.fn();
      renderManualTimeEntryForm({ onSave });

      const projectSelect = screen.getByRole('combobox');
      await userEvent.click(projectSelect);
      await userEvent.click(screen.getByText('Project 1'));

      const startDateInput = screen.getByLabelText(/Start Date/i);
      const endDateInput = screen.getByLabelText(/End Date/i);
      const startTimeInput = getTimeInputByLabel(/Start Time/i);
      const endTimeInput = getTimeInputByLabel(/End Time/i);

      fireEvent.change(startDateInput, { target: { value: '2025-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2025-01-02' } });
      fireEvent.change(startTimeInput, { target: { value: '00:00' } });
      fireEvent.change(endTimeInput, { target: { value: '02:00' } });

      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

      const saveButton = getSaveButton();
      await userEvent.click(saveButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(onSave).not.toHaveBeenCalled();

      confirmSpy.mockReturnValue(true);
      await userEvent.click(saveButton);
      expect(onSave).toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });
});
