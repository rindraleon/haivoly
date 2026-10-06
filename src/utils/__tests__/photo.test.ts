/**
 * Préparation des photos avant envoi : nom, type MIME, libellés d'étape.
 *
 * Ces règles sont partagées par tous les écrans d'upload (intervention,
 * observation, récolte) : elles doivent rester cohérentes pour que le retour
 * visuel et l'en-tête `multipart` soient identiques partout.
 */
import { fichierDepuisUri, LIBELLE_ETAPE_ENVOI } from '../photo';

describe('fichierDepuisUri', () => {
  it('déduit le nom et le type MIME de l’extension', () => {
    expect(fichierDepuisUri('file:///tmp/IMG_0042.PNG')).toEqual({
      uri: 'file:///tmp/IMG_0042.PNG',
      name: 'IMG_0042.PNG',
      type: 'image/png',
    });
  });

  it('reconnaît les formats produits par les appareils photo', () => {
    expect(fichierDepuisUri('file:///tmp/a.jpg').type).toBe('image/jpeg');
    expect(fichierDepuisUri('file:///tmp/a.jpeg').type).toBe('image/jpeg');
    expect(fichierDepuisUri('file:///tmp/a.webp').type).toBe('image/webp');
    expect(fichierDepuisUri('file:///tmp/a.heic').type).toBe('image/heic');
  });

  it('retombe sur JPEG quand l’extension est absente ou inconnue', () => {
    const sansExtension = fichierDepuisUri('file:///tmp/photo');
    expect(sansExtension.type).toBe('image/jpeg');
    expect(sansExtension.name).toMatch(/\.jpg$/);

    expect(fichierDepuisUri('file:///tmp/photo.bizz').type).toBe('image/jpeg');
  });

  it('ignore les paramètres de requête ajoutés par le sélecteur', () => {
    const fichier = fichierDepuisUri('file:///tmp/photo.jpg?width=400');
    expect(fichier.name).toBe('photo.jpg');
    expect(fichier.type).toBe('image/jpeg');
  });
});

describe('LIBELLE_ETAPE_ENVOI', () => {
  it('décrit chaque étape en français, sans jargon', () => {
    expect(LIBELLE_ETAPE_ENVOI.compression).toBe('Compression de la photo…');
    expect(LIBELLE_ETAPE_ENVOI.envoi).toBe('Envoi en cours…');
    // Aucun libellé pendant l'état inactif : rien ne doit s'afficher.
    expect(LIBELLE_ETAPE_ENVOI.inactif).toBe('');
  });

  it('ne révèle aucun détail technique', () => {
    for (const libelle of Object.values(LIBELLE_ETAPE_ENVOI)) {
      expect(libelle).not.toMatch(/multipart|axios|formdata|jpeg|http/i);
    }
  });
});
