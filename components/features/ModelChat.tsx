import { Card } from '@nextui-org/react';
import { useChat } from 'ai/react';
import { MultimodalInput } from '@/components/custom/multimodal-input';
import { StreamingMarkdown } from '@/components/custom/streaming-markdown';

export function ModelChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    body: {
      model: 'groq',
      stream: true
    }
  });

  return (
    <Card className="w-full max-w-4xl mx-auto p-4">
      <div className="flex flex-col space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-default-100'
              }`}
            >
              {message.role === 'user' ? 
                message.content : 
                <StreamingMarkdown content={message.content} />
              }
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 w-full max-w-4xl mx-auto p-4 bg-background/70 backdrop-blur-xl">
        <MultimodalInput
          input={input}
          setInput={(value) => handleInputChange({ target: { value } } as any)}
          handleSubmit={handleSubmit}
        />
      </div>
    </Card>
  );
} 