import * as Location from 'expo-location';

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export async function getCurrentLocation(): Promise<GPSPosition> {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error(
      'Permission de localisation refusée.',
    );
  }

  const servicesEnabled =
    await Location.hasServicesEnabledAsync();

  if (!servicesEnabled) {
    throw new Error(
      'Veuillez activer la localisation GPS.',
    );
  }

  console.log(
    'GPS : recherche d’une position récente...',
  );

  return new Promise(async (resolve, reject) => {
    let subscription:
      | Location.LocationSubscription
      | null = null;

    let bestLocation:
      | Location.LocationObject
      | null = null;

    let latestLocation:
      | Location.LocationObject
      | null = null;

    const finish = (
      location: Location.LocationObject,
    ) => {
      if (subscription) {
        subscription.remove();
        subscription = null;
      }

      console.log('GPS : position retenue', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      resolve({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy:
          location.coords.accuracy ?? undefined,
      });
    };

    // Attendre jusqu'à 10 secondes
    const timeout = setTimeout(() => {
  if (bestLocation) {
    const accuracy = bestLocation.coords.accuracy;

    if (accuracy !== null && accuracy <= 20) {
      finish(bestLocation);
      return;
    }

    if (subscription) {
      subscription.remove();
      subscription = null;
    }

    reject(
      new Error(
        `GPS trop imprécis (${accuracy?.toFixed(1) ?? 'inconnue'} m). Veuillez patienter et réessayer.`,
      ),
    );
    return;
  }

  if (subscription) {
    subscription.remove();
    subscription = null;
  }

  reject(
    new Error(
      'Impossible d’obtenir une position GPS suffisamment précise.',
    ),
  );
}, 10000);

    try {
      subscription =
        await Location.watchPositionAsync(
          {
            accuracy:
              Location.Accuracy.BestForNavigation,
            distanceInterval: 1,
            timeInterval: 1000,
          },
          (location) => {
            latestLocation = location;

            console.log('GPS UPDATE:', {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy,
            });

            // Garder la position ayant la meilleure précision
            if (
              !bestLocation ||
              (location.coords.accuracy ?? 9999) <
                (bestLocation.coords.accuracy ?? 9999)
            ) {
              bestLocation = location;
            }

            // Si précision <= 10 m,
            // on considère la position suffisamment bonne.
            if (
              location.coords.accuracy !== null &&
              location.coords.accuracy <= 10
            ) {
              clearTimeout(timeout);
              finish(location);
            }
          },
        );
    } catch (error) {
      clearTimeout(timeout);

      if (subscription) {
        subscription.remove();
        subscription = null;
      }

      reject(error);
    }
  });
}