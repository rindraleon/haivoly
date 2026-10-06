/**
 * Point d'entrée unique des services HTTP.
 *
 * Les écrans et les hooks n'importent plus jamais `axios` : tout passe par
 * `http` (`@/services/http`), qui applique l'URL de base, le jeton et le
 * déballage d'enveloppe. Les types métier viennent de `@/types`.
 */
export * from './http';
export * from './auth.service';
export * from './parcelle.service';
export * from './culture.service';
export * from './intervention.service';
export * from './observation.service';
export * from './recolte.service';
export * from './recommendation.service';
export * from './dashboard.service';
export * from './sync.service';
export * from './location.service';
