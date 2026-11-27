import {
  getTodaySegments,
  getTodayProjectHours,
  getRecentProjects,
} from '../today';
import { Project, TimeEntry } from '../../../types';

const entry = (
  id: string,
  projectId: string,
  start: string,
  end: string
): TimeEntry => ({
  id,
  projectId,
  startTime: new Date(start).toISOString(),
  endTime: new Date(end).toISOString(),
  description: '',
  createdAt: '',
  updatedAt: '',
});

const project = (id: string, isArchived = false): Project => ({
  id,
  name: id,
  description: '',
  monthlyCapacity: 0.3,
  isArchived,
  createdAt: '',
  updatedAt: '',
});

const NOW = new Date(2026, 10, 26, 13, 30);

describe('getTodaySegments', () => {
  it('今日の記録を 6:00〜21:00 の帯に対する位置と幅（%）に変換する', () => {
    const entries = [
      entry('a', 'p1', '2026-11-26T09:00:00', '2026-11-26T10:30:00'),
      entry('old', 'p1', '2026-11-25T09:00:00', '2026-11-25T10:00:00'),
    ];

    const segments = getTodaySegments(entries, NOW);

    expect(segments).toHaveLength(1);
    expect(segments[0].projectId).toBe('p1');
    expect(segments[0].left).toBeCloseTo(20, 5); // 3h / 15h
    expect(segments[0].width).toBeCloseTo(10, 5); // 1.5h / 15h
  });

  it('帯の外にはみ出す部分は切り詰める', () => {
    const entries = [
      entry('a', 'p1', '2026-11-26T05:00:00', '2026-11-26T07:30:00'),
    ];

    const [segment] = getTodaySegments(entries, NOW);

    expect(segment.left).toBe(0);
    expect(segment.width).toBeCloseTo(10, 5); // 6:00〜7:30
  });
});

describe('getTodayProjectHours', () => {
  it('今日のプロジェクト別時間を多い順に返す', () => {
    const entries = [
      entry('a', 'p1', '2026-11-26T09:00:00', '2026-11-26T10:00:00'),
      entry('b', 'p2', '2026-11-26T10:00:00', '2026-11-26T12:30:00'),
      entry('c', 'p1', '2026-11-26T13:00:00', '2026-11-26T13:30:00'),
      entry('d', 'p2', '2026-11-25T10:00:00', '2026-11-25T12:00:00'),
    ];

    expect(getTodayProjectHours(entries, NOW)).toEqual([
      { projectId: 'p2', hours: 2.5 },
      { projectId: 'p1', hours: 1.5 },
    ]);
  });
});

describe('getRecentProjects', () => {
  it('アーカイブ以外を最近使った順に返し、上限で切る', () => {
    const projects = [
      project('p1'),
      project('p2'),
      project('p3'),
      project('arch', true),
    ];
    const entries = [
      entry('a', 'p1', '2026-11-20T09:00:00', '2026-11-20T10:00:00'),
      entry('b', 'p3', '2026-11-25T09:00:00', '2026-11-25T10:00:00'),
      entry('c', 'arch', '2026-11-26T09:00:00', '2026-11-26T10:00:00'),
    ];

    expect(getRecentProjects(projects, entries, 2).map((p) => p.id)).toEqual([
      'p3',
      'p1',
    ]);
  });
});

describe('終了時刻のない記録', () => {
  it('今日の集計では現在時刻までとして扱う', () => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
    const open = {
      ...entry('o', 'p1', '2026-11-26T12:00:00', '2026-11-26T12:00:00'),
      endTime: '',
    };

    const hours = getTodayProjectHours([open], NOW);
    jest.useRealTimers();

    expect(hours).toEqual([{ projectId: 'p1', hours: 1.5 }]);
  });
});
