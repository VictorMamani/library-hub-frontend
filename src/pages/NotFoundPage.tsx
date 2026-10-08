import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section>
      <h1>Página no encontrada</h1>
      <p>La dirección no corresponde a una página de la biblioteca.</p>
      <Link
        className="button secondary"
        to="/"
      >
        Volver al catálogo
      </Link>
    </section>
  );
}
