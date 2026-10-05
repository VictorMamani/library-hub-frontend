import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signIn, signUp } from '../services/api';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { user, initializing, sessionError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const candidate: unknown = (location.state as { from?: unknown } | null)?.from;
  const destination =
    typeof candidate === 'string' && candidate.startsWith('/') && !candidate.startsWith('//')
      ? candidate
      : '/loans';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const email = String(values.get('email') ?? '')
      .trim()
      .toLowerCase();
    const password = String(values.get('password') ?? '');
    setBusy(true);
    setError(null);
    try {
      if (register) await signUp(String(values.get('name') ?? '').trim(), email, password);
      else await signIn(email, password);
      navigate(destination, { replace: true });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  }

  if (user && !initializing)
    return (
      <Navigate
        to={destination}
        replace
      />
    );
  return (
    <section className={styles.panel}>
      <Link
        to="/"
        className={styles.back}
      >
        Volver al catálogo
      </Link>
      <h1>{register ? 'Crea tu cuenta' : 'Bienvenido a tu biblioteca'}</h1>
      <p>
        {register
          ? 'Guarda tus préstamos y consulta tus próximas devoluciones.'
          : 'Inicia sesión para tomar prestados libros y consultar tu historial.'}
      </p>
      <form
        onSubmit={submit}
        className={styles.form}
      >
        {register && (
          <label>
            Nombre
            <input
              name="name"
              autoComplete="name"
              minLength={2}
              maxLength={80}
              required
            />
          </label>
        )}
        <label>
          Correo electrónico
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </label>
        <div>
          <label htmlFor="password">Contraseña</label>
          <div className={styles.password}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={register ? 'new-password' : 'current-password'}
              minLength={12}
              maxLength={128}
              aria-describedby="password-help"
              required
            />
            <button
              type="button"
              className={styles.showPassword}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
        <p
          id="password-help"
          className={styles.help}
        >
          Usa entre 12 y 128 caracteres.
        </p>
        {(error || sessionError) && (
          <p
            className="error"
            role="alert"
          >
            {error || sessionError}
          </p>
        )}
        <button
          className="button"
          type="submit"
          disabled={busy || initializing}
        >
          {busy ? 'Procesando…' : register ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>
      </form>
      <div className={styles.switchMode}>
        <span>{register ? '¿Ya tienes cuenta?' : '¿Es tu primera visita?'}</span>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setRegister((value) => !value);
            setError(null);
          }}
        >
          {register ? 'Iniciar sesión' : 'Crear una cuenta'}
        </button>
      </div>
    </section>
  );
}
