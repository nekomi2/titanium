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

const formats = ['webm', 'avi', 'gif', 'mov']

export function checkVideoURL(url: string): boolean {
    return formats.some(format => url.toLowerCase().endsWith(format));
  }

export function getFormat(url: string): string {
    return formats.find(format => url.toLowerCase().endsWith(format)) || '';
}