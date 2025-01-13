import { ModelChat } from "./ModelChat";

export default function ChatPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Chat</h1>
        <p className="text-gray-600 mt-2">
          Converse com seus documentos
        </p>
      </div>
      <ModelChat />
    </div>
  );
} 