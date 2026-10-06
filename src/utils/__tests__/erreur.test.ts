/**
 * Erreurs API : message lisible et rattachement aux champs.
 *
 * Vérifie le contrat établi avec le backend : le mobile lit le `code` (jamais le
 * texte) et rattache chaque erreur au bon champ via `path`, index compris.
 */
import { ApiError } from '@/services/http';

import {
  champIndexe,
  codeErreur,
  erreurChamp,
  erreurElement,
  erreursParChamp,
  estErreurDe,
  messageErreur,
} from '../erreur';

/** Erreur de validation telle que la produit le backend. */
function erreurValidation() {
  return new ApiError('Certaines informations sont invalides.', 400, 'VALIDATION_ERROR', undefined, [
    { field: 'email', path: ['email'], code: 'VALIDATION_INVALID_FORMAT', message: 'Email invalide' },
    {
      field: 'telephone',
      path: ['telephone'],
      code: 'VALIDATION_INVALID_FORMAT',
      message: 'Téléphone invalide',
    },
    {
      field: 'pointsGPS.2.latitude',
      path: ['pointsGPS', 2, 'latitude'],
      code: 'VALIDATION_REQUIRED',
      message: 'La latitude est obligatoire',
    },
  ]);
}

describe('messageErreur', () => {
  it('affiche le message du serveur', () => {
    const erreur = new ApiError('Email ou mot de passe incorrect.', 401, 'AUTH_INVALID_CREDENTIALS');
    expect(messageErreur(erreur, 'Défaut')).toBe('Email ou mot de passe incorrect.');
  });

  it('retombe sur le message par défaut pour une erreur inconnue', () => {
    expect(messageErreur(new Error('boom'), 'Une erreur est survenue.')).toBe(
      'Une erreur est survenue.',
    );
  });

  it('affiche le message réseau déjà traduit par le client HTTP', () => {
    const reseau = new ApiError(
      'Impossible de joindre le serveur. Vérifiez votre connexion.',
      0,
      'NETWORK_ERROR',
    );
    expect(messageErreur(reseau, 'Défaut')).toContain('Impossible de joindre le serveur');
    expect(messageErreur(reseau, 'Défaut')).not.toContain('Network Error');
  });

  it('ne remonte jamais le texte d’une exception JavaScript brute', () => {
    // `toApiError` classe toute erreur non HTTP en UNKNOWN : l'écran garde
    // alors son propre message, jamais « TypeError: … ».
    expect(messageErreur(new TypeError('Cannot read property x'), 'Formulaire invalide.')).toBe(
      'Formulaire invalide.',
    );
  });
});

describe('codeErreur / estErreurDe', () => {
  it('expose le code stable du serveur', () => {
    const erreur = new ApiError('déjà utilisée', 409, 'USER_EMAIL_ALREADY_EXISTS');
    expect(codeErreur(erreur)).toBe('USER_EMAIL_ALREADY_EXISTS');
    expect(estErreurDe(erreur, 'USER_EMAIL_ALREADY_EXISTS')).toBe(true);
    expect(estErreurDe(erreur, 'RESOURCE_NOT_FOUND')).toBe(false);
  });

  it('ne considère pas un code générique comme un code métier', () => {
    expect(codeErreur(new ApiError('erreur', 500, 'HTTP_ERROR'))).toBeNull();
    expect(codeErreur(new ApiError('inconnue', 0, 'UNKNOWN'))).toBeNull();
    expect(codeErreur(new Error('boom'))).toBeNull();
  });

  it('expose NETWORK_ERROR : le mobile doit détecter le mode hors-ligne', () => {
    const horsLigne = new ApiError('Impossible de joindre le serveur.', 0, 'NETWORK_ERROR');
    expect(codeErreur(horsLigne)).toBe('NETWORK_ERROR');
    expect(horsLigne.isNetworkError).toBe(true);
  });
});

describe('rattachement aux champs', () => {
  it('indexe les erreurs par nom de champ (formulaire à plat)', () => {
    expect(erreursParChamp(erreurValidation())).toEqual({
      email: 'Email invalide',
      telephone: 'Téléphone invalide',
      pointsGPS: 'La latitude est obligatoire',
    });
  });

  it('trouve le message d’un champ simple', () => {
    expect(erreurChamp(erreurValidation(), 'email')).toBe('Email invalide');
    expect(erreurChamp(erreurValidation(), 'password')).toBeUndefined();
  });

  it('rattache l’erreur au bon élément d’une liste, par index', () => {
    // L'utilisateur doit voir l'erreur sur le 3ᵉ point (index 2) — et sur lui seul.
    expect(erreurElement(erreurValidation(), 'pointsGPS', 2)).toBe('La latitude est obligatoire');
    expect(erreurElement(erreurValidation(), 'pointsGPS', 0)).toBeUndefined();
    expect(erreurElement(erreurValidation(), 'pointsGPS', 1)).toBeUndefined();
  });

  it('remonte aussi une erreur portant sur le tableau entier', () => {
    const erreur = new ApiError('trop peu de points', 400, 'VALIDATION_ERROR', undefined, [
      { field: 'pointsGPS', path: ['pointsGPS'], code: 'VALIDATION_INVALID_VALUE', message: 'Ajoutez au moins 3 sommets' },
    ]);
    expect(erreurElement(erreur, 'pointsGPS', 0)).toBe('Ajoutez au moins 3 sommets');
  });

  it('ignore une charge utile de champs malformée', () => {
    const erreur = new ApiError('erreur', 400, 'VALIDATION_ERROR', undefined, [
      // @ts-expect-error — test de robustesse : entrée sans `field`
      { message: 'sans champ' },
    ]);
    expect(erreur.fields).toHaveLength(0);
    expect(erreursParChamp(erreur)).toEqual({});
  });

  it('ne casse pas quand le serveur ne renvoie pas de champs', () => {
    const erreur = new ApiError('Erreur serveur', 500, 'SERVER_ERROR');
    expect(erreur.hasFieldErrors).toBe(false);
    expect(erreursParChamp(erreur)).toEqual({});
    expect(messageErreur(erreur, 'Défaut')).toBe('Erreur serveur');
  });
});

describe('champIndexe', () => {
  it('remonte le chemin structuré fourni par le serveur', () => {
    expect(champIndexe(['pointsGPS', 2, 'latitude'])).toBe('pointsGPS.2.latitude');
    expect(champIndexe(['email'])).toBe('email');
  });
});
