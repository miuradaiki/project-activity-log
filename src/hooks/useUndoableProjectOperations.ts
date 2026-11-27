import React, { useCallback, useMemo } from 'react';
import { Project, TimeEntry } from '../types';
import { ProjectOperations } from './useProjectOperations';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  projectOps: ProjectOperations;
  projects: Project[];
  timeEntries: TimeEntry[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
}

const appendMissing = (prev: TimeEntry[], restored: TimeEntry[]) => {
  const ids = new Set(prev.map((e) => e.id));
  return [...prev, ...restored.filter((e) => !ids.has(e.id))];
};

/**
 * 削除・アーカイブを確認なしで実行し、「元に戻す」付きの通知を出す。
 * 確認ダイアログで止めるより、取り消せるほうが操作の流れを妨げないため。
 */
export const useUndoableProjectOperations = ({
  projectOps,
  projects,
  timeEntries,
  setProjects,
  setTimeEntries,
}: Props): ProjectOperations => {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const offerUndo = useCallback(
    (message: string, undo: () => void) =>
      showToast({
        message,
        action: { label: t('undo.action'), onClick: undo },
      }),
    [showToast, t]
  );

  const deleteTimeEntry = useCallback(
    (id: string) => {
      const entry = timeEntries.find((e) => e.id === id);
      projectOps.deleteTimeEntry(id);
      if (!entry) return;
      offerUndo(t('undo.entry.deleted'), () =>
        setTimeEntries((prev) => appendMissing(prev, [entry]))
      );
    },
    [timeEntries, projectOps, offerUndo, setTimeEntries, t]
  );

  const archiveProject = useCallback(
    (project: Project) => {
      projectOps.archiveProject(project);
      // 通知を出している間に編集されても上書きしないよう、アーカイブ状態だけを戻す
      offerUndo(t('undo.project.archived', { name: project.name }), () =>
        setProjects((prev) =>
          prev.map((p) =>
            p.id === project.id
              ? {
                  ...p,
                  isArchived: project.isArchived,
                  archivedAt: project.archivedAt,
                }
              : p
          )
        )
      );
    },
    [projectOps, offerUndo, setProjects, t]
  );

  const deleteProject = useCallback(
    async (project: Project) => {
      const index = projects.findIndex((p) => p.id === project.id);
      const stopped = await projectOps.deleteProject(project);
      const entries = [
        ...timeEntries.filter((e) => e.projectId === project.id),
        ...stopped,
      ];
      offerUndo(
        t('undo.project.deleted', {
          name: project.name,
          count: entries.length,
        }),
        () => {
          // 並び順は色の割り当てに使うので、元の位置へ戻す
          setProjects((prev) => {
            if (prev.some((p) => p.id === project.id)) return prev;
            const next = [...prev];
            next.splice(index < 0 ? next.length : index, 0, project);
            return next;
          });
          setTimeEntries((prev) => appendMissing(prev, entries));
        }
      );
      return stopped;
    },
    [
      projects,
      timeEntries,
      projectOps,
      offerUndo,
      setProjects,
      setTimeEntries,
      t,
    ]
  );

  return useMemo(
    () => ({ ...projectOps, deleteTimeEntry, archiveProject, deleteProject }),
    [projectOps, deleteTimeEntry, archiveProject, deleteProject]
  );
};
