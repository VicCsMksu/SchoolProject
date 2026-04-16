import { useState } from "react";
import { MessageSquare, Send, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Inbox = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>
      <div className="px-5 pt-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">Inbox</h1>
            <p className="mb-4 text-sm text-muted-foreground">
              Use this inbox to chat with the admin for any concerns. You may also attach files if needed.
            </p>
          </div>
          <MessageSquare className="mt-1 text-muted-foreground" size={24} />
        </div>

        <div className="border-b border-border pb-2">
          <h2 className="text-sm font-bold text-primary">Chat with Admin</h2>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5">
        <p className="text-sm italic text-muted-foreground">
          No messages yet. Start the conversation below.
        </p>
      </div>

      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <button className="text-primary">
          <Paperclip size={20} />
        </button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message..."
          className="flex-1"
        />
        <Button size="sm" className="rounded-lg font-semibold">
          Send
        </Button>
      </div>
    </div>
  );
};

export default Inbox;
