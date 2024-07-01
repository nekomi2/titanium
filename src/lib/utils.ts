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

export function isValidUrl(urlString: string): boolean {
  var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
  '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
return !!urlPattern.test(urlString)}