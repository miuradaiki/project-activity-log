import React, { useState } from 'react';
import {
  Container,
  Box,
  Button,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Add as AddIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { Project, TimeEntry } from './types';

import { v4 as uuidv4 } from 'uuid';
import { ProjectList } from './components/ProjectList';
import { ProjectForm } from './components/ProjectForm';
import { Timer } from './components/timer/Timer';
import { TimeEntryList } from './components/timer/TimeEntryList';
import { ManualTimeEntryForm } from './components/timer/ManualTimeEntryForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { useStorage } from './hooks/useStorage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const App: React.FC = () => {
  // CSV インポート関数
  const handleImportCSV = async () => {
    try {
      const filePath = await window.electronAPI.showOpenFileDialog();
      if (!filePath) return; // ユーザーがキャンセルした場合

      const { safeImportWorkLog } = await import('./utils/safeImportUtils');
      const result = await safeImportWorkLog(
        filePath,
        projects,
        timeEntries,
        (updatedProjects, updatedTimeEntries) => {
          setProjects(updatedProjects);
          setTimeEntries(updatedTimeEntries);
        }
      );

      if (result.success) {
        console.log('インポートが成功しました。バックアップ:', result.backupPath);
      } else {
        console.error('インポートに失敗しました:', result.error);
      }
    } catch (error) {
      console.error('インポート処理中にエラーが発生しました:', error);
    }
  };

  const { projects, setProjects, timeEntries, setTimeEntries, isLoading } = useStorage();
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isManualEntryFormOpen, setIsManualEntryFormOpen] = useState(false);
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | undefined>(undefined);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    const timestamp = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp,
      isArchived: false,
    };
    setProjects([...projects, newProject]);
  };

  const handleEditProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProject) return;

    const updatedProject: Project = {
      ...editingProject,
      ...projectData,
      updatedAt: new Date().toISOString(),
    };

    setProjects(projects.map((p) => (p.id === editingProject.id ? updatedProject : p)));
    setEditingProject(undefined);
  };

  const handleArchiveProject = (project: Project) => {
    const updatedProject: Project = {
      ...project,
      isArchived: true,
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // アクティブなプロジェクトがアーカイブされる場合、タイマーを停止
    if (activeProject?.id === project.id && isTimerRunning) {
      handleStopTimer();
    }

    setProjects(projects.map(p => p.id === project.id ? updatedProject : p));
  };

  const handleUnarchiveProject = (project: Project) => {
    const updatedProject: Project = {
      ...project,
      isArchived: false,
      archivedAt: undefined,
      updatedAt: new Date().toISOString(),
    };

    setProjects(projects.map(p => p.id === project.id ? updatedProject : p));
  };

  const handleDeleteProject = (project: Project) => {
    if (activeProject?.id === project.id && isTimerRunning) {
      handleStopTimer();
    }
    setProjects(projects.filter((p) => p.id !== project.id));
    setTimeEntries(timeEntries.filter((t) => t.projectId !== project.id));
  };

  const handleStartTimer = (project: Project) => {
    if (isTimerRunning) {
      handleStopTimer();
    }

    const startTime = new Date().toISOString();
    setStartTime(startTime);
    setIsTimerRunning(true);
    setActiveProject(project);
  };

  const handleStopTimer = () => {
    if (!activeProject || !startTime) return;

    const endTime = new Date().toISOString();
    const newTimeEntry: TimeEntry = {
      id: uuidv4(),
      projectId: activeProject.id,
      startTime,
      endTime,
      description: '',
      createdAt: endTime,
      updatedAt: endTime,
    };

    setTimeEntries([...timeEntries, newTimeEntry]);
    setIsTimerRunning(false);
    setStartTime(null);
    setActiveProject(null);
  };

  const handleDeleteTimeEntry = (timeEntryId: string) => {
    setTimeEntries(timeEntries.filter((t) => t.id !== timeEntryId));
  };

  const handleOpenProjectForm = (project?: Project) => {
    setEditingProject(project);
    setIsProjectFormOpen(true);
  };

  const handleCloseProjectForm = () => {
    setIsProjectFormOpen(false);
    setEditingProject(undefined);
  };

  const handleSaveTimeEntry = (timeEntry: TimeEntry) => {
    if (editingTimeEntry) {
      setTimeEntries(timeEntries.map(t => t.id === timeEntry.id ? timeEntry : t));
      setEditingTimeEntry(undefined);
    } else {
      setTimeEntries([...timeEntries, timeEntry]);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          aria-label="basic tabs example"
        >
          <Tab label="タイマー" />
          <Tab label="ダッシュボード" />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setIsManualEntryFormOpen(true)}
          >
            作業時間を手動入力
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenProjectForm()}
            >
              プロジェクトを追加
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={handleImportCSV}
            >
              CSVインポート
            </Button>
          </Box>
        </Box>

        <Timer
          project={activeProject}
          isRunning={isTimerRunning}
          startTime={startTime}
          onStart={() => activeProject && handleStartTimer(activeProject)}
          onStop={handleStopTimer}
        />

        <ProjectList
          projects={projects}
          onEditProject={handleOpenProjectForm}
          onDeleteProject={handleDeleteProject}
          onArchiveProject={handleArchiveProject}
          onUnarchiveProject={handleUnarchiveProject}
          onStartTimer={handleStartTimer}
          activeProjectId={activeProject?.id || null}
          timeEntries={timeEntries}
        />

        <TimeEntryList
          timeEntries={timeEntries}
          projects={projects}
          onDeleteTimeEntry={handleDeleteTimeEntry}
          onEditTimeEntry={(entry) => {
            setEditingTimeEntry(entry);
            setIsManualEntryFormOpen(true);
          }}
        />
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <Dashboard
          projects={projects}
          timeEntries={timeEntries}
        />
      </TabPanel>

      <ProjectForm
        open={isProjectFormOpen}
        onClose={handleCloseProjectForm}
        onSave={editingProject ? handleEditProject : handleCreateProject}
        project={editingProject}
        projects={projects}
      />

      <ManualTimeEntryForm
        open={isManualEntryFormOpen}
        onClose={() => {
          setIsManualEntryFormOpen(false);
          setEditingTimeEntry(undefined);
        }}
        onSave={handleSaveTimeEntry}
        projects={projects}
        timeEntry={editingTimeEntry}
      />
    </Container>
  );
};

export default App;
