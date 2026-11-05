export const unwrap = (response) => {
  const body = response?.data;
  if (
    body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    "data" in body
  ) {
    return body.data;
  }
  return body;
};
