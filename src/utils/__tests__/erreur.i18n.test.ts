import { i18n, initialiserInstance, LANGUE_PAR_DEFAUT } from '@/i18n/instance';
import { messageErreur, traduireCodeErreur } from '@/utils/erreur';


/** Reconstruit une erreur réseau telle que `services/http` la produirait. */
function erreurApi(code: string, message: string, statut = 400) {
  return {
    isAxiosError: true,
    response: {
      status: statut,
      data: { success: false, code, errorCode: code, message },
    },
  };
}

beforeAll(async () => {
  await initialiserInstance(LANGUE_PAR_DEFAUT);
});

afterAll(async () => {
  await i18n.changeLanguage(LANGUE_PAR_DEFAUT);
});

describe('traduireCodeErreur', () => {
  it('renvoie la traduction française par défaut', () => {
    expect(traduireCodeErreur('AUTH_INVALID_CREDENTIALS')).toBe(
      'E-mail ou mot de passe incorrect.'
    );
  });

  it('renvoie null pour un code inconnu (repli sur le message serveur)', () => {
    expect(traduireCodeErreur('CODE_QUI_N_EXISTE_PAS')).toBeNull();
    expect(traduireCodeErreur(null)).toBeNull();
  });
});

describe('messageErreur suit la langue active', () => {
  const erreur = erreurApi(
    'AUTH_INVALID_CREDENTIALS',
    'E-mail ou mot de passe incorrect.',
    401
  );

  it('français', async () => {
    await i18n.changeLanguage('fr');
    expect(messageErreur(erreur, 'repli')).toBe(
      'E-mail ou mot de passe incorrect.'
    );
  });

  it('anglais', async () => {
    await i18n.changeLanguage('en');
    expect(messageErreur(erreur, 'repli')).toBe(
      'Incorrect email or password.'
    );
  });

  it('malgache', async () => {
    await i18n.changeLanguage('mg');
    expect(messageErreur(erreur, 'repli')).toBe(
      'Diso ny mailaka na ny tenimiafina.'
    );
  });

  it('les trois textes sont distincts (pas de copie paresseuse)', async () => {
    const textes = new Set<string>();
    for (const langue of ['fr', 'en', 'mg'] as const) {
      await i18n.changeLanguage(langue);
      textes.add(messageErreur(erreur, 'repli'));
    }
    expect(textes.size).toBe(3);
  });
});

describe('codes métier critiques', () => {
  const cas: [string, string][] = [
    ['PARCEL_INVALID_GEOMETRY', 'en'],
    ['AUTH_EMAIL_NOT_VERIFIED', 'en'],
    ['AUTH_VERIFICATION_RESEND_LIMIT', 'en'],
    ['PAYLOAD_TOO_LARGE', 'en'],
  ];

  it.each(cas)('%s est traduit (et pas renvoyé brut)', async (code) => {
    await i18n.changeLanguage('en');
    const texte = messageErreur(erreurApi(code, code), 'repli');
    expect(texte).not.toBe(code);
    expect(texte.length).toBeGreaterThan(10);
  });
});

describe('repli quand le code est inconnu', () => {
  it("utilise le message du serveur plutôt qu'un texte vide", async () => {
    await i18n.changeLanguage('fr');
    const erreur = erreurApi('CODE_INCONNU_DU_BACKEND', 'Message du serveur.');
    expect(messageErreur(erreur, 'repli')).toBe('Message du serveur.');
  });

  it('utilise le défaut fourni si rien d’autre n’est exploitable', async () => {
    await i18n.changeLanguage('fr');
    expect(messageErreur(new Error('boom'), 'texte par défaut')).toBe(
      'texte par défaut'
    );
  });
});
