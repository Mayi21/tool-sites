export async function onRequest(context) {
  const workerUrl = "https://toolifyhub-backend.xaoohii.workers.dev/sitemap.xml";
  try {
    const response = await fetch(workerUrl);
    if (!response.ok) {
      return new Response("Error fetching sitemap from worker", { status: response.status });
    }
    const sitemapContent = await response.text();
    return new Response(sitemapContent, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error in sitemap.xml Pages Function:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}