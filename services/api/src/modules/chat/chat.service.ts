import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { userService } from '../users/user.service.js';

export class ChatService {
  async chat(userId: string, input: { provider: string; model: string; messages: any[] }) {
    const apiKey = await userService.getApiKey(userId, input.provider);

    if (!apiKey) {
      throw new Error(`API key for ${input.provider} not found. Please set it in settings.`);
    }

    switch (input.provider) {
      case 'openai':
        return this.handleOpenAI(apiKey, input.model, input.messages);
      case 'anthropic':
        return this.handleAnthropic(apiKey, input.model, input.messages);
      case 'google':
        return this.handleGoogle(apiKey, input.model, input.messages);
      default:
        throw new Error(`Provider ${input.provider} not supported`);
    }
  }

  private async handleOpenAI(apiKey: string, model: string, messages: any[]) {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: model || 'gpt-4o',
      messages,
    });
    return response.choices[0].message;
  }

  private async handleAnthropic(apiKey: string, model: string, messages: any[]) {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: model || 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: messages.filter(m => m.role !== 'system'), // Basic filter for Claude
      system: messages.find(m => m.role === 'system')?.content
    });
    return response.content[0];
  }

  private async handleGoogle(apiKey: string, model: string, messages: any[]) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelInstance = genAI.getGenerativeModel({ model: model || 'gemini-1.5-pro' });
    
    // Basic conversion for Gemini
    const lastMessage = messages[messages.length - 1].content;
    const history = messages.slice(0, -1).map(m => ({
      role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: m.content }]
    }));

    const chat = modelInstance.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    return { content: response.text() };
  }
}

export const chatService = new ChatService();
