import {test} from 'node:test';
import assert from 'node:assert/strict';
import store from '../test-store/store.js';
const {useEditor}=store;
test('undo redo, branch edit, and new project history isolation',()=>{
 const p={name:'original',media:[]};useEditor.getState().set(p,'test');
 useEditor.getState().updateProject({...p,name:'edited'});
 useEditor.getState().undo();assert.equal(useEditor.getState().project.name,'original');
 useEditor.getState().redo();assert.equal(useEditor.getState().project.name,'edited');
 useEditor.getState().undo();useEditor.getState().updateProject({...p,name:'branch'});assert.equal(useEditor.getState().future.length,0);
 useEditor.getState().set(p,'other');assert.equal(useEditor.getState().past.length,0);
});
