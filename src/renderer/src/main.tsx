import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './ui/App';
import './ui/styles.css';

class StartupBoundary extends React.Component<React.PropsWithChildren, {failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<StartupFailure/>:this.props.children;}
}
function StartupFailure(){return <main role="alert" style={{padding:32,maxWidth:760}}>
  <h1>VisionForge could not start the editor</h1>
  <p>The editor’s desktop connection or interface failed to load. Editing controls are unavailable.</p>
  <p>Close this window and launch VisionForge from the Windows Start menu. If this screen returns, report “Editor startup failed” with a screenshot.</p>
  <p>No AI license or API key is required to open the editor.</p>
</main>;}
const bridge=window.visionForge;
const ready=bridge&&['newProject','openProject','onExportProgress'].every(name=>typeof (bridge as unknown as Record<string,unknown>)[name]==='function');
createRoot(document.getElementById('root')!).render(<React.StrictMode><StartupBoundary>{ready?<App/>:<StartupFailure/>}</StartupBoundary></React.StrictMode>);
