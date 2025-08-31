export async function onRequest(context) {
  const workerUrl = "https://toolifyhub-backend.xaoohii.workers.dev/robots.txt";
  try {
    const response = await fetch(workerUrl);
    if (!response.ok) {
      return new Response("Error fetching robots.txt from worker", { status: response.status });
    }
    const robotsContent = await response.text();
    return new Response(robotsContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error in robots.txt Pages Function:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}