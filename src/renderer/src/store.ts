import { create } from 'zustand';
import type { ImportedMedia, ProjectDocument } from './types/project';
interface State {
  past: ProjectDocument[];
  future: ProjectDocument[];
  undo: () => void;
  redo: () => void;
  project: ProjectDocument | null;
  path: string | null;
  set: (project: ProjectDocument, path: string) => void;
  add: (media: ImportedMedia[]) => void;
  updateProject: (project: ProjectDocument) => void;
}
export const useEditor = create<State>(set => ({
  project: null, path: null, past: [], future: [],
  undo: () => set(s => s.project && s.past.length ? {project:s.past[s.past.length-1],past:s.past.slice(0,-1),future:[s.project,...s.future]} : s),
  redo: () => set(s => s.project && s.future.length ? {project:s.future[0],past:[...s.past,s.project],future:s.future.slice(1)} : s),
  set: (project, path) => set({project, path, past:[], future:[]}),
  add: media => set(s => s.project ? {past:[...s.past,s.project].slice(-100),future:[],project:{...s.project, media:[...s.project.media,...media]}} : s),
  updateProject: project => set(s => ({project,past:s.project?[...s.past,s.project].slice(-100):[],future:[]}))
}));
