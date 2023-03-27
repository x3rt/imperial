export class GitHub {
  public static async createGist(
    content: string,
    documentId: string,
    userAuth: string,
    language?: string
  ) {
    const gist = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: `token ${userAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: {
          [`${documentId}`]: {
            content,
          },
        },
      }),
    }).then((res) => res.json());
    return gist;
  }
}
