import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../platform/settings';
import { webgl2Available } from '../scenes/quality';
import type { SceneController } from '../scenes/scene-controller';
import type { PickId, SceneViewData } from '../scenes/views';
import { Schematic } from './Schematic';

interface Props {
  view: SceneViewData;
  onPick: (id: PickId) => void;
  /** Change `nonce` to move the camera to `id` (or home when null). */
  focus: { id: string | null; nonce: number };
}

function Canvas3D({ view, onPick, focus, onFail }: Props & { onFail: () => void }) {
  const { settings, reducedMotion } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<SceneController | null>(null);
  const latest = useRef({ view, onPick, onFail, reducedMotion });
  latest.current = { view, onPick, onFail, reducedMotion };
  const [ready, setReady] = useState(false);

  // One controller per mounted canvas. The cleanup disposes it, so remounts,
  // route changes and hot reload never leave a second loop running.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let controller: SceneController | null = null;
    import('../scenes/scene-controller')
      .then(({ SceneController }) => {
        if (cancelled) return;
        controller = new SceneController(canvas, {
          kind: latest.current.view.kind,
          quality: settings.quality,
          reducedMotion: latest.current.reducedMotion,
          onPick: (id) => latest.current.onPick(id),
          onContextLost: () => latest.current.onFail(),
        });
        controller.setView(latest.current.view);
        controllerRef.current = controller;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) latest.current.onFail();
      });
    return () => {
      cancelled = true;
      controller?.dispose();
      controllerRef.current = null;
    };
  }, [settings.quality]);

  useEffect(() => {
    controllerRef.current?.setView(view);
  }, [view, ready]);

  useEffect(() => {
    controllerRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion, ready]);

  useEffect(() => {
    if (focus.nonce > 0) controllerRef.current?.focus(focus.id);
  }, [focus, ready]);

  return (
    <>
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="img"
        data-ready={ready}
        aria-label="3D reconstruction. Drag to orbit, scroll to zoom, arrow keys to pan. Every target here is also a button in the panel."
      />
      {!ready && <p className="scene-loading">Preparing the reconstruction…</p>}
    </>
  );
}

export function SceneView(props: Props) {
  const { settings } = useSettings();
  const [failed, setFailed] = useState(false);
  const supported = webgl2Available();
  const use3d = settings.graphics !== '2d' && supported && !failed;

  return (
    <div className="scene" data-mode={use3d ? '3d' : '2d'}>
      {use3d ? (
        // Keyed so a quality change gets a fresh canvas and context.
        <Canvas3D key={`${props.view.kind}-${settings.quality}`} {...props} onFail={() => setFailed(true)} />
      ) : (
        <Schematic view={props.view} />
      )}
      {!use3d && settings.graphics !== '2d' && (
        <p className="scene-note" role="status">
          3D view unavailable on this device. Showing the 2D view. Nothing is missing.{' '}
          {failed && (
            <button className="link" onClick={() => setFailed(false)}>
              Try 3D again
            </button>
          )}
        </p>
      )}
    </div>
  );
}
