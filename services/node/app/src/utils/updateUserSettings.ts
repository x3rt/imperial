import { request } from "./Request";

interface Settings {
  clipboard?: boolean;
  longUrls?: boolean;
  shortUrls?: boolean;
  instantDelete?: boolean;
  encrypted?: boolean;
  imageEmbed?: boolean;
  expiration?: number;
  fontLigatures?: boolean;
  fontSize?: number;
  renderWhitespace?: boolean;
  wordWrap?: boolean;
  tabSize?: number;
}

/* Ill type data later */
interface Response {
  data: any | boolean;
  error: number | false;
}

export const updateUserSettings = async (
  settings: Settings,
): Promise<Response> => {
  const { data, error } = await request("/user/@me", "PATCH", {
    ...settings,
  });

  if (error) {
    return { data: false, error: error.code };
  }

  return { data, error: false };
};
