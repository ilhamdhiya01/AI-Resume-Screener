import { ErrorCode, FileRejection } from 'react-dropzone';
import { create } from 'zustand';

interface AnalysisState {
  file: File | null;
  uploadTime: Date | null;
  jobDescription: string;

  // Dropzone state
  fileRejections: FileRejection[];
  isDragActive: boolean;
  isDragReject: boolean;
  dropZoneErrorCode: ErrorCode | null;
  modalCancelProcess: boolean;
  open: (() => void) | null;
}

interface AnalysisActions {
  setFile: (file: File | null) => void;
  setUploadTime: (time: Date | null) => void;
  setJobDescription: (description: string) => void;

  setFileRejections: (rejections: FileRejection[]) => void;
  setIsDragActive: (active: boolean) => void;
  setIsDragReject: (reject: boolean) => void;
  clearFile: () => void;
  reset: () => void;
  setModalCancelProcess: (cancel: boolean) => void;
  setOpenFileDialog: (open: (() => void) | null) => void;
}

type AnalysisStore = AnalysisState & AnalysisActions;

const InitialState: AnalysisState = {
  file: null,
  uploadTime: null,
  jobDescription: '',
  fileRejections: [],
  isDragActive: false,
  isDragReject: false,
  dropZoneErrorCode: null,
  modalCancelProcess: false,
  open: () => null,
};

export const useAnalysisStore = create<AnalysisStore>()((set) => ({
  ...InitialState,
  setFile: (file: File | null) =>
    set({ file, uploadTime: file ? new Date() : null }),
  setUploadTime: (time: Date | null) => set({ uploadTime: time }),
  setJobDescription: (description: string) =>
    set({ jobDescription: description }),
  setFileRejections: (rejections: FileRejection[]) =>
    set({ fileRejections: rejections }),
  setIsDragActive: (active: boolean) => set({ isDragActive: active }),
  setIsDragReject: (reject: boolean) => set({ isDragReject: reject }),
  clearFile: () => set({ file: null, uploadTime: null, fileRejections: [] }),
  reset: () => set(InitialState),
  setModalCancelProcess: (cancel: boolean) =>
    set({ modalCancelProcess: cancel }),
  setOpenFileDialog: (open: (() => void) | null) => set({ open }),
}));
