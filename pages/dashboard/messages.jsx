import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import React from "react";

const Inbox = () => {
  const { data: user } = useQuery(["user"], async () => {
    const response = await axios.get("/api/auth/me");

    return response.data;
  });

  const { data: inbox, isLoading } = useQuery(
    ["inbox", user?.id],
    async () => {
      const response = await axios.get(`/api/messages/inbox`);

      return response.data;
    },
    { enabled: !!user }
  );

  return (
    <DashboardLayout role={user?.role}>
      <div className="col-span-full col-start-2">
        <p className="text-2xl font-bold">Inbox Zone</p>
      </div>

      <div className="col-span-full col-start-2 flex gap-4 flex-wrap">
        {isLoading ? (
          <>
            <Skeleton className="h-24 min-w-[20rem]" />
            <Skeleton className="h-24 min-w-[20rem]" />
            <Skeleton className="h-24 min-w-[20rem]" />
            <Skeleton className="h-24 min-w-[20rem]" />
          </>
        ) : (
          <>
            {inbox.map((messages) => (
              <Link
                key={messages.id}
                href={`/dashboard/messages/${messages.sender.id}`}
              >
                <Card className="min-w-[20rem] max-w-xs hover:bg-slate-100">
                  <CardHeader>
                    <CardTitle>
                      {messages.sender.firstName} {messages.sender.lastName}
                    </CardTitle>
                    <CardDescription>{messages.content}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Inbox;
