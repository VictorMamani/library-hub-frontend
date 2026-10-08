import { useRef, useState } from 'react';
import { useResource } from './useResource';
import { prepareProfilePhoto } from '../utils/profilePhoto';
import { removeProfilePhoto, saveProfilePhoto } from '../services/profile';
import type { ProfilePhoto } from '../services/profile';

export function useProfilePhoto() {
  const {
    data,
    loading,
    error: loadError,
    reload,
  } = useResource<ProfilePhoto>('/profile/photo', true);
  const [saved, setSaved] = useState<ProfilePhoto | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const locked = useRef(false);

  async function perform(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      await action();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'No se pudo actualizar la foto. Intenta nuevamente.',
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function select(file: File) {
    await perform(async () => {
      setDraft(await prepareProfilePhoto(file));
    });
  }

  async function save() {
    if (!draft) return;
    await perform(async () => {
      setSaved(await saveProfilePhoto(draft));
      setDraft(null);
      setNotice('Foto de perfil guardada.');
    });
  }

  async function remove() {
    await perform(async () => {
      setSaved(await removeProfilePhoto());
      setDraft(null);
      setNotice('Foto de perfil eliminada.');
    });
  }

  function cancel() {
    setDraft(null);
    setError(null);
    setNotice('');
  }

  return {
    photo: draft ?? (saved ?? data)?.photo ?? null,
    hasDraft: draft !== null,
    loading,
    busy,
    error: error ?? (saved === null ? loadError : null),
    notice,
    reload,
    select,
    save,
    remove,
    cancel,
  };
}
