import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const Message = () => {
  const router = useRouter();

  const { data: user } = useQuery(["user"], async () => {
    const response = await axios.get("/api/auth/me");

    return response.data;
  });

  const { data: receiver } = useQuery(
    ["user", router.query.id],
    async () => {
      const response = await axios.get(`/api/users/${router.query.id}`);

      return response.data;
    },
    { enabled: !!router.query.id }
  );

  const [message, setMessage] = useState("");

  const { data: messages, refetch } = useQuery(
    ["messages", router.query.id],
    async () => {
      const { data } = await axios.get(
        `/api/messages?senderId=${router.query.id}`
      );
      return data;
    },
    { enabled: !!user }
  );

  const mutation = useMutation(
    (newMessage) =>
      axios.post(`/api/messages?receiverId=${router.query.id}`, {
        content: newMessage,
      }),
    { onSuccess: () => refetch() }
  );

  const sendMessage = async (e) => {
    e.preventDefault();
    mutation.mutate(message);
    setMessage("");
  };

  return (
    <DashboardLayout role={user?.role}>
      {receiver && (
        <div className="col-start-2 col-span-full">
          <p className="text-2xl font-bold">{receiver.name}</p>
        </div>
      )}

      <ScrollArea className="col-span-full col-start-2 h-[70vh] bg-slate-100 col-end-7 p-3 flex flex-col">
        {messages &&
          messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "w-full flex",
                message.senderId === user?.id && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "w-fit px-4 py-2 rounded-full my-2",
                  message.senderId === user?.id
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-900"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
      </ScrollArea>

      <form
        onSubmit={sendMessage}
        className="flex justify-between col-start-2 col-end-7 gap-4 col-span-full"
      >
        <Input value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button className="space-x-2" type="submit">
          <Send strokeWidth={1.5} />
          <span>Send</span>
        </Button>
      </form>
    </DashboardLayout>
  );
};

export default Message;
