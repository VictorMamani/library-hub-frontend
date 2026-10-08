import { useRef } from 'react';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import styles from './ProfilePhotoEditor.module.css';

export function ProfilePhotoEditor({ name }: { name: string }) {
  const input = useRef<HTMLInputElement>(null);
  const { photo, hasDraft, loading, busy, error, notice, reload, select, save, remove, cancel } =
    useProfilePhoto();
  return (
    <section
      className={styles.editor}
      aria-labelledby="profile-photo-heading"
      aria-busy={busy || loading}
    >
      <h2 id="profile-photo-heading">Foto de perfil</h2>
      <input
        ref={input}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        tabIndex={-1}
        aria-label="Seleccionar foto de perfil"
        disabled={busy || loading}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void select(file);
        }}
      />
      <button
        type="button"
        className={styles.photo}
        aria-label={photo ? 'Cambiar foto de perfil' : 'Añadir foto de perfil'}
        disabled={busy || loading}
        onClick={() => input.current?.click()}
      >
        {photo ? (
          <img
            src={photo}
            alt={`Foto de ${name}`}
            width="256"
            height="256"
          />
        ) : (
          <span className={styles.placeholder}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{loading ? 'Cargando foto…' : 'Añadir foto'}</span>
          </span>
        )}
      </button>
      <div className={styles.actions}>
        {hasDraft ? (
          <>
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => void save()}
            >
              {busy ? 'Guardando…' : 'Guardar foto'}
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={cancel}
            >
              Cancelar
            </button>
          </>
        ) : (
          photo && (
            <>
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => input.current?.click()}
              >
                Cambiar foto
              </button>
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => void remove()}
              >
                {busy ? 'Eliminando…' : 'Eliminar foto'}
              </button>
            </>
          )
        )}
      </div>
      {error && (
        <div role="alert">
          <p className="error">{error}</p>
          <button
            type="button"
            className="button secondary"
            disabled={busy || loading}
            onClick={reload}
          >
            Volver a cargar foto
          </button>
        </div>
      )}
      {notice && (
        <p
          className="notice"
          role="status"
        >
          {notice}
        </p>
      )}
      {hasDraft && (
        <p className={styles.caption}>Vista previa. Guarda la foto para aplicar el cambio.</p>
      )}
    </section>
  );
}
