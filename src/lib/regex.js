export const regexCbuCvu = /^\d{22}$/;
export const regexAlias = /^[a-zA-Z0-9.-]{6,20}$/;
export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
