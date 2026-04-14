import { chatService } from './chat.service.js';
export async function chatRoutes(server) {
    server.post('/', {
        preHandler: [server.authenticate]
    }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const response = await chatService.chat(userId, request.body);
            return { response };
        }
        catch (error) {
            reply.status(500).send({ message: error.message });
        }
    });
}
