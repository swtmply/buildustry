import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const NotificationList = ({ children, isLoading }) => {
  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
      </div>
    );

  return <ul>{children}</ul>;
};

const NotificationListItem = ({ notification }) => {
  return (
    <div
      className={cn(
        "border-b py-2 hover:bg-slate-100 cursor-pointer",
        !notification.isRead && "font-semibold"
      )}
    >
      <p>{notification.title}</p>
      <p className="text-sm">{notification.content}</p>
    </div>
  );
};

const NotificationPopover = () => {
  const queryClient = useQueryClient();

  const { data: user } = useQuery(["user"], async () => {
    const response = await axios.get("/api/auth/me");

    return response.data;
  });

  const { data: notifications, isLoading } = useQuery(
    ["notification", user?.id],
    async () => {
      const response = await axios.get(`/api/users/${user?.id}/notification`);
      return response.data;
    },
    {
      enabled: !!user,
    }
  );

  const { mutate } = useMutation(
    async () => {
      const response = await axios.put(`/api/users/${user?.id}/notification`);

      return response.data;
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["notification", user?.id]);
      },
    }
  );

  const unreadCount = useMemo(() => {
    if (!notifications?.message) {
      return notifications?.reduce((count, notification) => {
        if (!notification.isRead) {
          return count + 1;
        }
        return count;
      }, 0);
    }
    return 0;
  }, [notifications]);

  return (
    <Popover
      onOpenChange={(open) => {
        if (open === false) {
          mutate();
        }
      }}
    >
      <PopoverTrigger className="relative">
        {unreadCount ? (
          <div className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white">
            <span className="text-xs">{unreadCount}</span>
          </div>
        ) : null}
        <Bell size={24} />
      </PopoverTrigger>
      <PopoverContent>
        <NotificationList isLoading={isLoading}>
          <h4 className="font-bold text-lg">Notifications</h4>

          {!notifications?.message ? (
            notifications?.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <p> {notifications.message} </p>
          )}
        </NotificationList>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;
