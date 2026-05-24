import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";

type PhotoRequest = {
  base64Image: string;
};

async function routes(fastify: FastifyInstance, options: any) {
  fastify.post<{ Body: PhotoRequest }>("/", async (request, reply) => {
    try {
      const { base64Image = "" } = request.body;
      const base64ImageData = base64Image
        .split("data:image/png;base64,")
        .filter(Boolean)
        .toString();
      console.log(base64ImageData.slice(0, 200));
      const binary = Buffer.from(base64ImageData, "base64");
      await fs.writeFile(`./uploads/photo-${randomUUID()}.png`, binary);
    } catch (error) {
      console.error(error);
    }
    return "pong!";
  });
}

export default routes;
