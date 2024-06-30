/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const { url } = await request.json();
  const response = await fetch(url);
  return new Response(response.body);
}
