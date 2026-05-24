import type { FastifyInstance } from "fastify";

async function routes(fastify: FastifyInstance, options: any) {
  fastify.get("/ping", async (request, reply) => {
    console.log("PING HIT");
    return "pong!";
  });
}

export default routes;
