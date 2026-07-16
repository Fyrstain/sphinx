export const getPublicPath = (): string => {
  const publicUrl = process.env.PUBLIC_URL;

  if (!publicUrl || publicUrl === ".") {
    return "";
  }

  return publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
};

export const toPublicUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicPath()}${normalizedPath}`;
};