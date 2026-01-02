import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * ManualTimeEntryForm のテスト用ヘルパークラス
 */
export class ManualTimeEntryFormTestHelper {
  private user: ReturnType<typeof userEvent.setup>;

  constructor(advanceTimers?: (ms: number) => void) {
    this.user = advanceTimers
      ? userEvent.setup({ advanceTimers })
      : userEvent.setup();
  }

  async selectProject(projectName: string) {
    const projectSelect = screen.getByRole('combobox');
    await this.user.click(projectSelect);
    await this.user.click(screen.getByText(projectName));
  }

  setTimeRange(startTime: string, endTime: string) {
    const timeInputs = screen.getAllByDisplayValue(/^\d{2}:\d{2}$/);
    fireEvent.change(timeInputs[0], { target: { value: startTime } });
    fireEvent.change(timeInputs[1], { target: { value: endTime } });
  }

  setTimeRangeByLabel(startTime: string, endTime: string) {
    const startTimeInput = this.getTimeInputByLabel(/Start Time/i);
    const endTimeInput = this.getTimeInputByLabel(/End Time/i);
    fireEvent.change(startTimeInput, { target: { value: startTime } });
    fireEvent.change(endTimeInput, { target: { value: endTime } });
  }

  setDateRange(startDate: string, endDate: string) {
    const startDateInput = screen.getByLabelText(/Start Date/i);
    const endDateInput = screen.getByLabelText(/End Date/i);
    fireEvent.change(startDateInput, { target: { value: startDate } });
    fireEvent.change(endDateInput, { target: { value: endDate } });
  }

  getTimeInputByLabel(label: RegExp): HTMLInputElement {
    const elements = screen.getAllByLabelText(label);
    const input = elements.find((el) => el.tagName === 'INPUT');
    if (!input) {
      throw new Error(`Time input for ${label} not found`);
    }
    return input as HTMLInputElement;
  }

  getSaveButton() {
    return screen.getByRole('button', { name: /保存|save|update/i });
  }

  getDescriptionInput() {
    return screen.getByRole('textbox');
  }

  async clickSave() {
    await this.user.click(this.getSaveButton());
  }

  async typeDescription(text: string) {
    await this.user.type(this.getDescriptionInput(), text);
  }

  async clearAndTypeDescription(text: string) {
    const input = this.getDescriptionInput();
    await this.user.clear(input);
    await this.user.type(input, text);
  }

  async fillAndSubmit(options: {
    project: string;
    startTime: string;
    endTime: string;
    description?: string;
  }) {
    await this.selectProject(options.project);
    this.setTimeRange(options.startTime, options.endTime);
    if (options.description) {
      await this.typeDescription(options.description);
    }
    await this.clickSave();
  }
}
