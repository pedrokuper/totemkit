// ESM
import Fastify from "fastify";
import fastifyMiddie from "@fastify/middie";
import fastifyCors from "@fastify/cors";

//ROUTES
import healthRoutes from "./routes/health.routes.ts";
import formRoutes from "./routes/form.routes.ts";
import photosRoute from "./routes/photos.route.ts";
import videosRoute from "./routes/video.route.ts";

//DATABASE
import { closeDb } from "./config/database/database.ts";
import { runMigrations } from "./config/database/schema.ts";

const BODY_LIMIT = 50 * 1024 * 1024; //50MB

const fastify = Fastify({
  logger: true,
  bodyLimit: BODY_LIMIT,
});

fastify.register(fastifyMiddie);
fastify.register(fastifyCors, {
  origin: ["http://localhost:5173"],
});

fastify.register(healthRoutes, { prefix: "/health" });
fastify.register(formRoutes, { prefix: "/api/forms" });
fastify.register(photosRoute, { prefix: "/api/photos" });
fastify.register(videosRoute, { prefix: "/api/videos" });

/**
 * Run the server!
 */
const start = async () => {
  try {
    runMigrations();
    await fastify.listen({ port: 8080 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await fastify.close();
    closeDb();
    process.exit(0);
  });
}

start();
