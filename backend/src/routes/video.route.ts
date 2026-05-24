import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";

type VideoRequest = {
  base64Video: string;
};

async function routes(fastify: FastifyInstance, options: any) {
  fastify.post<{ Body: VideoRequest }>("/", async (request) => {
    try {
      const { base64Video = "" } = request.body;
      const base64VideoData = base64Video
        .split("data:video/webm;base64,")
        .filter(Boolean)
        .toString();
      const binary = Buffer.from(base64VideoData, "base64");
      const filename = `video-${randomUUID()}.webm`;
      await fs.writeFile(`./uploads/${filename}`, binary);
      return { success: true, filename };
    } catch (error) {
      console.error(error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  });
}

export default routes;
