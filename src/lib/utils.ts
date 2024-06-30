export async function fetchFile(url: string) {
    const api_url = '/api' // Basically toBlobURL from ffmpeg utils
    const req = new Request(api_url, {
        method: 'POST',
        body: JSON.stringify({ url }),
    });
    const response = await fetch(req);
    const data = await response.arrayBuffer();
    return new Uint8Array(data);
  }
export function checkVideoURL(url: string): boolean {
    return url.toLowerCase().endsWith(".webm");
  }