

const PHOTON_URL = "https://photon.komoot.io/api/";


const searchPhoton = async (searchAddress) => {
  console.log(
    `Photon search: "${searchAddress}"`
  );

  const url = new URL(PHOTON_URL);

  url.searchParams.set(
    "q",
    searchAddress
  );

  url.searchParams.set(
    "limit",
    "1"
  );

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Photon request failed with status ${response.status}.`
    );
  }

  const data = await response.json();

  if (
    !data ||
    !Array.isArray(data.features) ||
    data.features.length === 0
  ) {
    return null;
  }

  const feature = data.features[0];

  const coordinates =
    feature?.geometry?.coordinates;

  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 2
  ) {
    return null;
  }

  /*
   * GeoJSON coordinates are:
   *
   * [longitude, latitude]
   */
  const longitude = Number(
    coordinates[0]
  );

  const latitude = Number(
    coordinates[1]
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  const properties =
    feature.properties || {};

  const formattedAddress =
    [
      properties.name,
      properties.street,
      properties.city,
      properties.state,
      properties.country,
    ]
      .filter(Boolean)
      .join(", ") ||
    searchAddress;

  return {
    latitude,
    longitude,
    formattedAddress,
  };
};

/**
 * Convert a human-readable address
 * into latitude and longitude.
 *
 * The service progressively broadens the search
 * if Photon cannot find the complete address.
 */
const geocodeAddress = async ({
  state,
  city,
  area,
  address,
  country = "Nigeria",
}) => {
  const searches = [];

  /*
   * 1. Full search
   *
   * Example:
   * Dominican University, Samonda,
   * Ibadan, Oyo, Nigeria
   */
  const fullAddress = [
    address,
    area,
    city,
    state,
    country,
  ].filter(Boolean);

  if (fullAddress.length > 0) {
    searches.push(
      fullAddress.join(", ")
    );
  }

  /*
   * 2. Address + city + state + country
   *
   * Useful if the area name causes
   * the full search to fail.
   */
  const addressCitySearch = [
    address,
    city,
    state,
    country,
  ].filter(Boolean);

  if (
    addressCitySearch.length > 0 &&
    addressCitySearch.join(", ") !==
      searches[searches.length - 1]
  ) {
    searches.push(
      addressCitySearch.join(", ")
    );
  }

  /*
   * 3. Area + city + state + country
   *
   * Example:
   * Samonda, Ibadan, Oyo, Nigeria
   */
  const areaSearch = [
    area,
    city,
    state,
    country,
  ].filter(Boolean);

  if (
    areaSearch.length > 0 &&
    areaSearch.join(", ") !==
      searches[searches.length - 1]
  ) {
    searches.push(
      areaSearch.join(", ")
    );
  }

  /*
   * 4. City + state + country
   */
  const citySearch = [
    city,
    state,
    country,
  ].filter(Boolean);

  if (
    citySearch.length > 0 &&
    citySearch.join(", ") !==
      searches[searches.length - 1]
  ) {
    searches.push(
      citySearch.join(", ")
    );
  }

  /*
   * 5. State + country
   */
  const stateSearch = [
    state,
    country,
  ].filter(Boolean);

  if (
    stateSearch.length > 0 &&
    stateSearch.join(", ") !==
      searches[searches.length - 1]
  ) {
    searches.push(
      stateSearch.join(", ")
    );
  }

  if (searches.length === 0) {
    throw new Error(
      "A location or address is required."
    );
  }

  /*
   * Try each search until Photon returns
   * a valid location.
   */
  for (const searchAddress of searches) {
    try {
      const result =
        await searchPhoton(
          searchAddress
        );

      if (result) {
        console.log(
          `Photon geocoding successful: "${result.formattedAddress}"`
        );

        return result;
      }

      console.log(
        `Photon found no result for "${searchAddress}".`
      );
    } catch (error) {
      console.error(
        `Photon search failed for "${searchAddress}":`,
        error.message
      );
    }
  }

  throw new Error(
    `Unable to find coordinates for "${searches[0]}".`
  );
};

module.exports = {
  geocodeAddress,
};
