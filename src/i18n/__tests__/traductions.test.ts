import fr from '../locales/fr';
import en from '../locales/en';
import mg from '../locales/mg';


/** Aplatit un objet imbriqué en liste de chemins (`erreurs.codes.BAD_REQUEST`). */
function chemins(objet: unknown, prefixe = ''): string[] {
  if (objet === null || typeof objet !== 'object') {
    return prefixe ? [prefixe] : [];
  }
  const resultat: string[] = [];
  for (const [cle, valeur] of Object.entries(objet as Record<string, unknown>)) {
    const chemin = prefixe ? `${prefixe}.${cle}` : cle;
    resultat.push(...chemins(valeur, chemin));
  }
  return resultat.sort();
}

function comparer(reference: string[], cible: string[], nom: string) {
  const manquantes = reference.filter((cle) => !cible.includes(cle));
  const superflues = cible.filter((cle) => !reference.includes(cle));

  expect({
    langue: nom,
    cles_manquantes: manquantes,
    cles_superflues: superflues,
  }).toEqual({ langue: nom, cles_manquantes: [], cles_superflues: [] });
}

describe('Parité des traductions', () => {
  const reference = chemins(fr);

  it('la référence française contient un nombre de clés cohérent', () => {
    // Garde-fou : une référence vidée par erreur ferait passer les autres tests.
    // 78 = nombre réel de feuilles au 2026-10-10. À relever quand on ajoute
    // des clés ; il sert à détecter une suppression accidentelle en masse.
    expect(reference.length).toBeGreaterThanOrEqual(78);
  });

  it('en contient exactement les mêmes clés que fr', () => {
    comparer(reference, chemins(en), 'en');
  });

  it('mg contient exactement les mêmes clés que fr', () => {
    comparer(reference, chemins(mg), 'mg');
  });

  it('aucune valeur n’est vide', () => {
    for (const [nom, dico] of [
      ['fr', fr],
      ['en', en],
      ['mg', mg],
    ] as const) {
      const vides = chemins(dico).filter((cle) => {
        const valeur = cle
          .split('.')
          .reduce<unknown>(
            (acc, segment) =>
              acc && typeof acc === 'object'
                ? (acc as Record<string, unknown>)[segment]
                : undefined,
            dico
          );
        return typeof valeur !== 'string' || valeur.trim() === '';
      });
      expect({ langue: nom, valeurs_vides: vides }).toEqual({
        langue: nom,
        valeurs_vides: [],
      });
    }
  });
});

/**
 * Codes d'erreur stables renvoyés par le backend.
 * Source : haivoly-back/src/common/errors/error-codes.ts
 *
 * Toute erreur exposée à l'utilisateur doit avoir une traduction dans les
 * trois langues. Si le backend ajoute un code, ce test échoue : c'est voulu.
 */
const CODES_BACKEND = [
  'VALIDATION_ERROR',
  'VALIDATION_REQUIRED',
  'VALIDATION_INVALID_FORMAT',
  'VALIDATION_INVALID_VALUE',
  'VALIDATION_UNKNOWN_FIELD',
  'AUTH_INVALID_CREDENTIALS',
  'AUTH_SESSION_EXPIRED',
  'AUTH_UNAUTHORIZED',
  'AUTH_FORBIDDEN',
  'AUTH_EMAIL_NOT_VERIFIED',
  'AUTH_EMAIL_DISPOSABLE',
  'AUTH_VERIFICATION_INVALID',
  'AUTH_VERIFICATION_EXPIRED',
  'AUTH_VERIFICATION_USED',
  'AUTH_VERIFICATION_RESEND_LIMIT',
  'AUTH_RESET_TOKEN_INVALID',
  'AUTH_RESET_TOKEN_EXPIRED',
  'AUTH_RESET_TOKEN_USED',
  'PARCEL_INVALID_GEOMETRY',
  'RESOURCE_NOT_FOUND',
  'RESOURCE_CONFLICT',
  'RESOURCE_ALREADY_EXISTS',
  'USER_EMAIL_ALREADY_EXISTS',
  'BAD_REQUEST',
  'PAYLOAD_TOO_LARGE',
  'UNSUPPORTED_MEDIA_TYPE',
  'TOO_MANY_REQUESTS',
  'SERVER_ERROR',
  'SERVER_UNAVAILABLE',
] as const;

describe('Couverture des codes d’erreur du backend', () => {
  it('les 29 codes sont couverts dans les trois langues', () => {
    expect(CODES_BACKEND).toHaveLength(29);

    for (const [nom, dico] of [
      ['fr', fr],
      ['en', en],
      ['mg', mg],
    ] as const) {
      const couverts = Object.keys(dico.erreurs.codes).sort();
      expect({ langue: nom, codes: couverts }).toEqual({
        langue: nom,
        codes: [...CODES_BACKEND].sort(),
      });
    }
  });

  it('aucun code n’est traduit par le code lui-même (placeholder oublié)', () => {
    for (const [nom, dico] of [
      ['fr', fr],
      ['en', en],
      ['mg', mg],
    ] as const) {
      for (const [code, texte] of Object.entries(dico.erreurs.codes)) {
        expect({ langue: nom, code, texte }).not.toEqual({
          langue: nom,
          code,
          texte: code,
        });
      }
    }
  });
});
