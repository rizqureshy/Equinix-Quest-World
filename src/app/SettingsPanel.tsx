import { useSettings, type GraphicsMode, type MotionPref, type Quality } from '../platform/settings';

export function SettingsPanel() {
  const { settings, update } = useSettings();
  return (
    <div className="settings" role="group" aria-label="Settings">
      <label>
        Graphics
        <select value={settings.graphics} onChange={(e) => update({ graphics: e.target.value as GraphicsMode })}>
          <option value="auto">Automatic</option>
          <option value="3d">3D</option>
          <option value="2d">2D only</option>
        </select>
      </label>
      <label>
        3D quality
        <select value={settings.quality} onChange={(e) => update({ quality: e.target.value as Quality })}>
          <option value="standard">Standard</option>
          <option value="low">Low</option>
        </select>
      </label>
      <label>
        Motion
        <select value={settings.motion} onChange={(e) => update({ motion: e.target.value as MotionPref })}>
          <option value="system">Follow device setting</option>
          <option value="reduce">Reduced</option>
          <option value="full">Full</option>
        </select>
      </label>
      <label className="check">
        <input type="checkbox" checked readOnly disabled /> Captions always on (this build has no audio)
      </label>
    </div>
  );
}
