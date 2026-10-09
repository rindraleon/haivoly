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
