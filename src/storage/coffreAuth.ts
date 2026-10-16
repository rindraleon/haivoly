import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { saveSession } from '@/storage/authStorage';

/**
 * Coffre d'authentification hors ligne (SecureStore) : après une connexion
 * réussie en ligne, une empreinte SHA-256 (email + mot de passe) et le profil
 * sont scellés sur l'appareil. Sans réseau, la même combinaison rouvre une
 * session locale courte (12 h) : aucune action n'est bloquée par une panne
 * de connexion, et le mot de passe n'est jamais stocké en clair.
 */
const EMAIL_KEY = 'haivoly_coffre_email';
const EMPREINTE_KEY = 'haivoly_coffre_empreinte';
const PROFIL_KEY = 'haivoly_coffre_profil';
const HORS_LIGNE_KEY = 'haivoly_session_hors_ligne';

/** Durée de vie d'une session rouverte sans serveur. */
const DUREE_SESSION_HORS_LIGNE_MS = 12 * 60 * 60 * 1000;

/** Profil minimal scellé : l'identifiant suffit à rouvrir la session. */
export interface ProfilCoffre {
  id: string;
}

interface Coffre {
  email: string;
  empreinte: string;
  profil: ProfilCoffre;
}

/** Empreinte irréversible de la paire d'identifiants (sel = email). */
export async function empreinteAuth(email: string, password: string): Promise<string> {
  const cle = `${email.trim().toLowerCase()}::${password}`;
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, cle);
}

/** Scelle le coffre après une connexion réussie en ligne. */
export async function scellerCoffre(args: {
  email: string;
  password: string;
  profil: ProfilCoffre;
}): Promise<void> {
  const empreinte = await empreinteAuth(args.email, args.password);
  await SecureStore.setItemAsync(EMAIL_KEY, args.email.trim().toLowerCase());
  await SecureStore.setItemAsync(EMPREINTE_KEY, empreinte);
  await SecureStore.setItemAsync(PROFIL_KEY, JSON.stringify(args.profil));
}

/** Lit le coffre ; `null` si aucun sceau n'a été posé sur cet appareil. */
export async function lireCoffre(): Promise<Coffre | null> {
  const [email, empreinte, profilBrut] = await Promise.all([
    SecureStore.getItemAsync(EMAIL_KEY),
    SecureStore.getItemAsync(EMPREINTE_KEY),
    SecureStore.getItemAsync(PROFIL_KEY),
  ]);
  if (!email || !empreinte || !profilBrut) return null;
  try {
    const profil = JSON.parse(profilBrut) as ProfilCoffre;
    if (!profil || typeof profil.id !== 'string') return null;
    return { email, empreinte, profil };
  } catch {
    return null;
  }
}

/** Vrai si la combinaison saisie correspond au sceau conservé. */
export async function correspondAuCoffre(email: string, password: string): Promise<boolean> {
  const coffre = await lireCoffre();
  if (!coffre) return false;
  if (coffre.email !== email.trim().toLowerCase()) return false;
  const empreinte = await empreinteAuth(email, password);
  return empreinte === coffre.empreinte;
}

/** Rouvre une session locale courte à partir du profil scellé. */
export async function ouvrirSessionHorsLigne(profil: ProfilCoffre): Promise<void> {
  const expiration = new Date(Date.now() + DUREE_SESSION_HORS_LIGNE_MS).toISOString();
  await saveSession(`hors-ligne-${profil.id}-${Date.now()}`, profil.id, expiration);
  await SecureStore.setItemAsync(HORS_LIGNE_KEY, '1');
}

/** Vrai si la session courante a été rouverte sans serveur. */
export async function sessionHorsLigneActive(): Promise<boolean> {
  return (await SecureStore.getItemAsync(HORS_LIGNE_KEY)) === '1';
}

/** Une connexion en ligne réussie referme le mode hors ligne. */
export async function marquerSessionEnLigne(): Promise<void> {
  await SecureStore.deleteItemAsync(HORS_LIGNE_KEY);
}
