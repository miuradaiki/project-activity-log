interface Window {
  electron: {
    saveTimeEntry: (data: {
      projectId: string;
      startTime: string;
      endTime: string;
      duration: number;
    }) => Promise<void>;
  };
}
