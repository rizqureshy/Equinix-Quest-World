import { describe, expect, it } from 'vitest';
import { clearSave, loadSave, saveKey, writeSave, type KeyValueStore } from '../../src/platform/save-store';
import { initialState } from '../../src/simulation/state';
import { atRecovery, episode, play, test as testRoute } from './helpers';

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

describe('save store', () => {
  it('returns none when nothing is saved', () => {
    expect(loadSave(memoryStore(), episode.id)).toEqual({ status: 'none' });
  });

  it('round-trips state from investigation, recovery and briefing', () => {
    const recovery = play(atRecovery('ask'), testRoute('R01', 'verifiedGauge'));
    const briefing = play(atRecovery(), [...testRoute('R03', 'verifiedGauge'), { type: 'proceedToBriefing' }]);
    const investigation = play(initialState(), [
      { type: 'chooseFieldAction', choice: 'continue' },
      { type: 'enterReconstruction' },
    ]);
    for (const state of [investigation, recovery, briefing]) {
      const store = memoryStore();
      expect(writeSave(store, episode.id, episode.contentVersion, state)).toBe(true);
      expect(loadSave(store, episode.id)).toEqual({ status: 'ok', state });
    }
  });

  it('reports malformed JSON as corrupt', () => {
    const store = memoryStore();
    store.data.set(saveKey(episode.id), '{not json');
    expect(loadSave(store, episode.id)).toEqual({ status: 'corrupt' });
  });

  it('reports an older or incompatible schema as corrupt', () => {
    const store = memoryStore();
    store.data.set(
      saveKey(episode.id),
      JSON.stringify({ episodeId: episode.id, contentVersion: '0.0.1', state: { ...initialState(), version: 0 } }),
    );
    expect(loadSave(store, episode.id)).toEqual({ status: 'corrupt' });
    store.data.set(
      saveKey(episode.id),
      JSON.stringify({ episodeId: episode.id, contentVersion: '0.1.0', state: { ...initialState(), phase: 'finale' } }),
    );
    expect(loadSave(store, episode.id)).toEqual({ status: 'corrupt' });
  });

  it('handles unavailable and full storage without throwing', () => {
    expect(loadSave(null, episode.id)).toEqual({ status: 'unavailable' });
    expect(writeSave(null, episode.id, episode.contentVersion, initialState())).toBe(false);
    const full: KeyValueStore = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    };
    expect(loadSave(full, episode.id)).toEqual({ status: 'unavailable' });
    expect(writeSave(full, episode.id, episode.contentVersion, initialState())).toBe(false);
    expect(() => clearSave(full, episode.id)).not.toThrow();
  });

  it('clears a save', () => {
    const store = memoryStore();
    writeSave(store, episode.id, episode.contentVersion, initialState());
    clearSave(store, episode.id);
    expect(loadSave(store, episode.id)).toEqual({ status: 'none' });
  });
});
