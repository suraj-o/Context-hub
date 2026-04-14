import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
export declare class ChatService {
    chat(userId: string, input: {
        provider: string;
        model: string;
        messages: any[];
    }): Promise<OpenAI.Chat.Completions.ChatCompletionMessage | Anthropic.Messages.ContentBlock | {
        content: string;
    }>;
    private handleOpenAI;
    private handleAnthropic;
    private handleGoogle;
}
export declare const chatService: ChatService;
