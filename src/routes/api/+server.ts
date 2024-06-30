/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { url } = await request.json();
  try {
    
    if (await getFileSize(url) > 1e7) {
      return new Response("File size larger than 10MB", { status: 400 });
    }
  } catch (error) {
    return new Response("Could not get content or content larger than 10MB", { status: 400 });
  }
  const response = await fetch(url);
  return new Response(response.body);
}
async function getFileSize(url: string) : Promise<number> {
  return new Promise((resolve, reject) => {
    fetch(url, { method: 'HEAD' })
      .then(response => {
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          resolve(parseInt(contentLength, 10));
        } else {
          reject(new Error('Content-Length header not found'));
        }
      })
      .catch(error => reject(error));
  });
}

