import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authService } from './auth.service.js';
import { signupSchema, loginSchema, SignupInput, LoginInput } from './auth.schema.js';

export async function authRoutes(server: FastifyInstance) {
  server.post('/signup', {
    schema: {
      body: signupSchema
    }
  }, async (request: FastifyRequest<{ Body: SignupInput }>, reply: FastifyReply) => {
    try {
      const user = await authService.signup(request.body);
      const token = server.jwt.sign({ id: user.id, email: user.email });
      
      reply.setCookie('token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return { user: { id: user.id, email: user.email, name: user.name } };
    } catch (error: any) {
      reply.status(400).send({ message: error.message });
    }
  });

  server.post('/login', {
    schema: {
      body: loginSchema
    }
  }, async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) => {
    try {
      const user = await authService.login(request.body);
      const token = server.jwt.sign({ id: user.id, email: user.email });

      reply.setCookie('token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return { user: { id: user.id, email: user.email, name: user.name } };
    } catch (error: any) {
      reply.status(401).send({ message: error.message });
    }
  });

  server.post('/logout', async (request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return { message: 'Logged out successfully' };
  });

  server.get('/me', {
    preHandler: [server.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return { user: request.user };
  });
}
