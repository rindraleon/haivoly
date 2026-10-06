/**
 * Gestion des 401 : « identifiants erronés » vs « session perdue ».
 *
 * Un utilisateur qui se trompe de mot de passe ne doit pas voir « votre session
 * a expiré » ; à l'inverse, un jeton expiré ne doit pas le laisser sur un écran
 * protégé vide et sans explication.
 */
import { estExpirationDeSession } from '@/services/http';

describe('estExpirationDeSession', () => {
  it('signale une session perdue', () => {
    expect(estExpirationDeSession(401, 'AUTH_SESSION_EXPIRED')).toBe(true);
    expect(estExpirationDeSession(401, 'AUTH_UNAUTHORIZED')).toBe(true);
    // Ancien backend sans `code` : on reste prudent, c'est bien une expiration.
    expect(estExpirationDeSession(401, undefined)).toBe(true);
    expect(estExpirationDeSession(401, 'HTTP_ERROR')).toBe(true);
  });

  it('ne signale pas un mot de passe erroné à la connexion', () => {
    expect(estExpirationDeSession(401, 'AUTH_INVALID_CREDENTIALS')).toBe(false);
  });

  it('ignore les autres statuts', () => {
    for (const statut of [200, 400, 403, 404, 409, 413, 415, 500]) {
      expect(estExpirationDeSession(statut, undefined)).toBe(false);
    }
  });
});
