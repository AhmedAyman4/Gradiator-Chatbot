'use client';

import {useState, useEffect, useRef} from 'react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {ScrollArea} from '@/components/ui/scroll-area';
import {cn} from '@/lib/utils';
import {generateWebsiteSummary} from '@/ai/flows/generate-website-summary';
import {answerQuestionsAboutWebsite} from '@/ai/flows/answer-questions-about-website';
import {icons} from '@/components/icons';

const WEBSITE_CONTENT = `
  Welcome to Acme Corp!

  We are a leading provider of innovative solutions for businesses of all sizes. Our mission is to help our clients succeed by providing them with the tools and resources they need to grow and thrive.

  Our services include:

  - Consulting
  - Training
  - Support

  Contact us today to learn more about how we can help you achieve your business goals.
`;

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{
    sender: 'user' | 'bot';
    text: string;
  }[]>([]);
  const [websiteSummary, setWebsiteSummary] = useState<string | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const summarizeWebsite = async () => {
      const summary = await generateWebsiteSummary({
        websiteContent: WEBSITE_CONTENT,
      });
      setWebsiteSummary(summary?.websiteSummary ?? null);
    };

    summarizeWebsite();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    chatWindowRef.current?.scrollTo({
      top: chatWindowRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    setMessages((prev) => [...prev, {sender: 'user', text: messageText}]);

    if (!websiteSummary) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Still processing the website. Please try again in a few seconds.',
        },
      ]);
      return;
    }

    const answer = await answerQuestionsAboutWebsite({
      question: messageText,
      websiteContent: WEBSITE_CONTENT,
    });

    setMessages((prev) => [
      ...prev,
      {sender: 'bot', text: answer?.answer ?? 'No answer found.'},
    ]);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        {isChatOpen ? (
          <ChatWindow
            onClose={toggleChat}
            onSendMessage={handleSendMessage}
            messages={messages}
            chatWindowRef={chatWindowRef}
          />
        ) : (
          <Button
            onClick={toggleChat}
            className="rounded-full bg-teal-500 p-4 shadow-lg transition hover:bg-teal-700"
          >
            <icons.messageSquare className="h-6 w-6 text-white" />
            <span className="sr-only">Open Chat</span>
          </Button>
        )}
      </div>
    </>
  );
}

interface ChatWindowProps {
  onClose: () => void;
  onSendMessage: (message: string) => void;
  messages: {sender: 'user' | 'bot'; text: string}[];
  chatWindowRef: React.RefObject<HTMLDivElement>;
}

const ChatWindow = ({
  onClose,
  onSendMessage,
  messages,
  chatWindowRef,
}: ChatWindowProps) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="w-96 rounded-lg bg-card shadow-xl animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Gradiator Chatbot</h2>
        <Button onClick={onClose} variant="ghost" className="h-8 w-8 p-0">
          <icons.close className="h-4 w-4" />
          <span className="sr-only">Close Chat</span>
        </Button>
      </div>
      <ScrollArea ref={chatWindowRef} className="h-[300px] p-4 pr-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'rounded-md px-3 py-2 text-sm w-fit max-w-[75%]',
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-secondary text-secondary-foreground mr-auto'
              )}
            >
              {message.text}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="m-4">
        <Textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="resize-none shadow-sm"
        />
        <div className="flex justify-end mt-2">
          <Button onClick={handleSend} size="sm">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
