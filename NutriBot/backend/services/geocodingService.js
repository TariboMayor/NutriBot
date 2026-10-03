const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/search";

const USER_AGENT =
  "NutriBot/1.0 (NutriBot hospital location search)";

const cleanValue = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/\s+/g, " ");
};

const normalizeForComparison = (value) => {
  return cleanValue(value)
    .toLowerCase()
    .replace(/[,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const isDuplicateLocation = (first, second) => {
  const a = normalizeForComparison(first);
  const b = normalizeForComparison(second);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  if (a.includes(b) || b.includes(a)) {
    return true;
  }

  return false;
};

const buildSearchAddress = ({
  state,
  city,
  area,
  address,
  country = "Nigeria",
}) => {
  const cleanedState = cleanValue(state);
  const cleanedCity = cleanValue(city);
  const cleanedArea = cleanValue(area);
  const cleanedAddress = cleanValue(address);
  const cleanedCountry = cleanValue(country);

  const parts = [];

  if (cleanedAddress) {
    parts.push(cleanedAddress);
  }

  if (
    cleanedArea &&
    !isDuplicateLocation(cleanedAddress, cleanedArea)
  ) {
    parts.push(cleanedArea);
  }

  if (
    cleanedCity &&
    !isDuplicateLocation(
      `${cleanedAddress}, ${cleanedArea}`,
      cleanedCity
    )
  ) {
    parts.push(cleanedCity);
  }

  if (
    cleanedState &&
    !isDuplicateLocation(
      `${cleanedAddress}, ${cleanedArea}, ${cleanedCity}`,
      cleanedState
    )
  ) {
    parts.push(cleanedState);
  }

  if (cleanedCountry) {
    parts.push(cleanedCountry);
  }

  return parts.join(", ");
};

/**
 * Ask Nominatim for coordinates.
 */
const searchNominatim = async (searchAddress) => {
  const cleanedSearch = cleanValue(searchAddress);

  if (!cleanedSearch) {
    return null;
  }

  console.log(
    `Nominatim search: "${cleanedSearch}"`
  );

  const url = new URL(NOMINATIM_URL);

  url.searchParams.set("q", cleanedSearch);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "ng");

  const response = await fetch(url, {
    method: "GET",

    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `OpenStreetMap Geocoding request failed with status ${response.status}.`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const result = data[0];

  const latitude = Number(result.lat);
  const longitude = Number(result.lon);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
    formattedAddress:
      result.display_name || cleanedSearch,
  };
};

/**
 * Create several increasingly broader searches.
 *
 * This is important because Nigerian addresses are not
 * always indexed by Nominatim exactly as entered.
 */
const buildSearchCandidates = ({
  state,
  city,
  area,
  address,
  country = "Nigeria",
}) => {
  const cleanedState = cleanValue(state);
  const cleanedCity = cleanValue(city);
  const cleanedArea = cleanValue(area);
  const cleanedAddress = cleanValue(address);
  const cleanedCountry = cleanValue(country);

  const candidates = [];

  const addCandidate = (parts) => {
    const value = parts
      .map(cleanValue)
      .filter(Boolean)
      .join(", ");

    if (!value) {
      return;
    }

    const alreadyExists = candidates.some(
      (candidate) =>
        normalizeForComparison(candidate) ===
        normalizeForComparison(value)
    );

    if (!alreadyExists) {
      candidates.push(value);
    }
  };

  /*
   * 1. Complete address.
   */
  addCandidate([
    cleanedAddress,
    cleanedArea,
    cleanedCity,
    cleanedState,
    cleanedCountry,
  ]);

  /*
   * 2. Address + city + state.
   */
  addCandidate([
    cleanedAddress,
    cleanedCity,
    cleanedState,
    cleanedCountry,
  ]);

  /*
   * 3. Area + city + state.
   *
   * Example:
   * Thomas Estate, Ajah, Lagos, Nigeria
   */
  addCandidate([
    cleanedArea,
    cleanedCity,
    cleanedState,
    cleanedCountry,
  ]);

  /*
   * 4. Address + area + state.
   */
  addCandidate([
    cleanedAddress,
    cleanedArea,
    cleanedState,
    cleanedCountry,
  ]);

  /*
   * 5. Address + city.
   */
  addCandidate([
    cleanedAddress,
    cleanedCity,
    cleanedCountry,
  ]);

  /*
   * 6. Area + city.
   */
  addCandidate([
    cleanedArea,
    cleanedCity,
    cleanedCountry,
  ]);

  /*
   * 7. City + state.
   *
   * This is the broader fallback.
   */
  addCandidate([
    cleanedCity,
    cleanedState,
    cleanedCountry,
  ]);

  /*
   * 8. State.
   */
  addCandidate([
    cleanedState,
    cleanedCountry,
  ]);

  return candidates;
};

const geocodeAddress = async ({
  state,
  city,
  area,
  address,
  country = "Nigeria",
}) => {
  const cleanedState = cleanValue(state);
  const cleanedCity = cleanValue(city);
  const cleanedArea = cleanValue(area);
  const cleanedAddress = cleanValue(address);
  const cleanedCountry = cleanValue(country);

  if (
    !cleanedState &&
    !cleanedCity &&
    !cleanedArea &&
    !cleanedAddress
  ) {
    throw new Error(
      "A location or address is required."
    );
  }

  const candidates = buildSearchCandidates({
    state: cleanedState,
    city: cleanedCity,
    area: cleanedArea,
    address: cleanedAddress,
    country: cleanedCountry,
  });

  console.log(
    "Geocoding candidates:",
    candidates
  );

  let lastError = null;

  for (const candidate of candidates) {
    try {
      const result =
        await searchNominatim(candidate);

      if (result) {
        console.log(
          `Geocoding successful: "${candidate}"`
        );

        return result;
      }

      console.log(
        `No geocoding result for: "${candidate}"`
      );
    } catch (error) {
      lastError = error;

      console.error(
        `Geocoding attempt failed for "${candidate}":`,
        error.message
      );
    }
  }

  if (lastError) {
    throw lastError;
  }

  const originalAddress = buildSearchAddress({
    state: cleanedState,
    city: cleanedCity,
    area: cleanedArea,
    address: cleanedAddress,
    country: cleanedCountry,
  });

  throw new Error(
    `Unable to find coordinates for "${originalAddress}".`
  );
};

module.exports = {
  geocodeAddress,
};
