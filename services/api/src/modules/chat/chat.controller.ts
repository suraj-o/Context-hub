import { FastifyInstance } from 'fastify';
import { chatService } from './chat.service.js';

interface ChatBody {
  provider: string;
  model: string;
  messages: any[];
}

export async function chatRoutes(server: FastifyInstance) {
  server.post<{ Body: ChatBody }>('/', {
    preHandler: [(server as any).authenticate]
  }, async (request, reply) => {
    try {
      const userId = ((request as any).user as any).id;
      const response = await chatService.chat(userId, request.body);
      return { response };
    } catch (error: any) {
      reply.status(500).send({ message: error.message });
    }
  });
}
