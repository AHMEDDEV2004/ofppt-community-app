import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI('AIzaSyA08NbEcn6gLIaBMCh7jSQtN7EjYI4nqFA');

// Storage key for chat history
const CHAT_HISTORY_KEY = 'ofppt_chat_history';

// Define chat message types
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

class ChatService {
  private model: GenerativeModel;
  private chatHistory: ChatMessage[];
  private static instance: ChatService;
  private initialized: boolean = false;

  private constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.chatHistory = [];
    this.loadHistory();
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private async loadHistory() {
    try {
      const savedHistory = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        this.chatHistory = JSON.parse(savedHistory);
      } else {
        // Initialize with example conversations
        this.chatHistory = [
          {
            role: 'assistant',
            content: 'Bonjour! Je suis votre Assistant AI OFPPT. Je suis là pour vous aider avec vos études, répondre à vos questions sur les programmes OFPPT et vous guider. Comment puis-je vous aider aujourd\'hui?',
            timestamp: Date.now() - 5000
          },
          {
            role: 'user',
            content: 'Quels sont les programmes disponibles en développement informatique?',
            timestamp: Date.now() - 4000
          },
          {
            role: 'assistant',
            content: 'L\'OFPPT propose plusieurs formations en développement informatique :\n\n1. Technicien Spécialisé en Développement Digital (Bac+2)\n2. Développeur Full Stack (Bac+2)\n3. Développeur Mobile (Formation qualifiante)\n4. Développeur .NET (Formation qualifiante)\n\nChaque programme a ses propres prérequis et durée. Souhaitez-vous des informations détaillées sur l\'un de ces programmes?',
            timestamp: Date.now() - 3000
          },
          {
            role: 'user',
            content: 'Je suis intéressé par le programme Full Stack. Quels sont les prérequis?',
            timestamp: Date.now() - 2000
          },
          {
            role: 'assistant',
            content: 'Pour le programme Développeur Full Stack, voici les prérequis :\n\n1. Niveau requis : Baccalauréat\n2. Bonne maîtrise des mathématiques\n3. Connaissance de base en anglais\n4. Passion pour la programmation\n\nLa formation dure 2 ans et couvre :\n- HTML, CSS, JavaScript\n- React, Node.js\n- Base de données SQL et NoSQL\n- Méthodologies Agile\n\nLes inscriptions se font généralement en septembre. Voulez-vous connaître les étapes d\'inscription?',
            timestamp: Date.now() - 1000
          }
        ];
        await this.saveHistory();
      }
      this.initialized = true;
    } catch (error) {
      console.error('Error loading chat history:', error);
      this.initialized = true;
    }
  }

  private async saveHistory() {
    try {
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(this.chatHistory));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  public async waitForInitialization() {
    if (!this.initialized) {
      await new Promise<void>((resolve) => {
        const checkInitialized = () => {
          if (this.initialized) {
            resolve();
          } else {
            setTimeout(checkInitialized, 100);
          }
        };
        checkInitialized();
      });
    }
  }

  public getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  public async generateAIResponse(message: string): Promise<string> {
    await this.waitForInitialization();

    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now()
      };
      this.chatHistory.push(userMessage);
      await this.saveHistory();

      // Create context from chat history
      const context = this.chatHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const prompt = `You are an AI assistant for OFPPT (Office de la Formation Professionnelle et de la Promotion du Travail) students.
      Previous conversation:
      ${context}
      
      Please provide a helpful and professional response to the user's last message.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Add AI response to history
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      };
      this.chatHistory.push(aiMessage);

      // Keep only the last 20 messages to prevent context from getting too long
      if (this.chatHistory.length > 20) {
        this.chatHistory = this.chatHistory.slice(-20);
      }

      await this.saveHistory();
      return responseText;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  public async clearHistory(): Promise<void> {
    this.chatHistory = [{
      role: 'assistant',
      content: 'Bonjour! Je suis votre Assistant AI OFPPT. Je suis là pour vous aider avec vos études, répondre à vos questions sur les programmes OFPPT et vous guider. Comment puis-je vous aider aujourd\'hui?',
      timestamp: Date.now()
    }];
    await this.saveHistory();
  }

  public async deleteMessage(timestamp: number): Promise<void> {
    this.chatHistory = this.chatHistory.filter(msg => msg.timestamp !== timestamp);
    await this.saveHistory();
  }
}

// Export a singleton instance
const chatService = ChatService.getInstance();
export const generateAIResponse = chatService.generateAIResponse.bind(chatService);
export const getChatHistory = chatService.getChatHistory.bind(chatService);
export const clearChatHistory = chatService.clearHistory.bind(chatService);
export const deleteMessage = chatService.deleteMessage.bind(chatService);

// Export types for use in components
export type { ChatMessage };
