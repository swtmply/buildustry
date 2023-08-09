import { cn } from "@/lib/utils";
import { History, LayoutDashboard, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const Navigation = ({ role }) => {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <nav>
      <ul className="font-medium space-y-4 text-slate-500">
        <Link
          href="/dashboard"
          className={cn(
            "flex gap-2",
            (pathname === "/dashboard" || pathname === "/dashboard/worker") &&
              "before:w-1 before:h-full before:bg-emerald-500 before:absolute before:-left-4 relative text-slate-900"
          )}
        >
          <LayoutDashboard size={24} />
          <span>Home</span>
        </Link>
        {role === "client" && (
          <Link
            href="/dashboard/team"
            className={cn(
              "flex gap-2",
              pathname === "/dashboard/team" &&
                "before:w-1 before:h-full before:bg-emerald-500 before:absolute before:-left-4 relative text-slate-900"
            )}
          >
            <Users size={24} />
            <span>My Team</span>
          </Link>
        )}
        <Link
          href="/dashboard/history"
          className={cn(
            "flex gap-2",
            pathname === "/dashboard/history" &&
              "before:w-1 before:h-full before:bg-emerald-500 before:absolute before:-left-4 relative text-slate-900"
          )}
        >
          <History size={24} />
          <span>History</span>
        </Link>
        <Link
          href="/dashboard/messages"
          className={cn(
            "flex gap-2",
            pathname.includes("messages") &&
              "before:w-1 before:h-full before:bg-emerald-500 before:absolute before:-left-4 relative text-slate-900"
          )}
        >
          <MessageSquare size={24} />
          <span>Messages</span>
        </Link>
      </ul>
    </nav>
  );
};

export default Navigation;
