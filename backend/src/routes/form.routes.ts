import type { FastifyInstance } from "fastify";

async function routes(fastify: FastifyInstance, options: any) {
  fastify.post("/", async (request, reply) => {
    console.log(request.body);
    return "pong!";
  });
}

export default routes;
