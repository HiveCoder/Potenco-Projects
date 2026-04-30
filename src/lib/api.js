export const readResponsePayload = async (response) => {
  const raw = await response.text();

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed for ${url}`);
  }

  return payload;
};