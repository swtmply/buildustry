import { Label } from "@radix-ui/react-label";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DashboardLayout from "@/components/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { getCookie } from "cookies-next";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import WorkerCard from "@/components/worker-card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [filters, setFilters] = useState(["contractor", "laborer"]);
  const { data: user, isLoading } = useQuery(["user"], async () => {
    const response = await axios.get("/api/auth/me");

    return response.data;
  });

  const { data: workers, isLoading: workersLoading } = useQuery(
    ["workers"],
    async () => {
      const response = await axios.get("/api/users");
      return response.data;
    }
  );

  const onBadgeClick = (filter) => {
    setFilters((prev) => {
      if (filters.includes(filter)) {
        return prev.filter((f) => f !== filter);
      }

      return [...prev, filter];
    });
  };

  return (
    <DashboardLayout role={user?.role}>
      <section className="flex flex-col col-span-full h-fit">
        <div className="flex flex-col">
          {!isLoading ? (
            <Label className="text-2xl font-bold text-slate-900">
              Hello, {user.name}
            </Label>
          ) : null}
          <Label className="text-slate-500">
            Welcome to Buildustry! What are you looking for?
          </Label>
        </div>
      </section>
      <div className="flex gap-2">
        <Badge
          onClick={() => onBadgeClick("contractor")}
          variant={filters.includes("contractor") ? "default" : "outline"}
          className="rounded-full cursor-pointer"
        >
          Contractors
        </Badge>
        <Badge
          onClick={() => onBadgeClick("laborer")}
          variant={filters.includes("laborer") ? "default" : "outline"}
          className="rounded-full cursor-pointer"
        >
          Laborers
        </Badge>
      </div>
      <div className="col-span-full flex flex-wrap gap-4">
        {filters.length !== 0 ? (
          workersLoading ? (
            [...new Array(8)].map((_, idx) => (
              <Skeleton className="w-[224px] h-[344px]" key={idx} />
            ))
          ) : (
            workers
              .filter((worker) => filters.includes(worker.role))
              .map((worker) => <WorkerCard key={worker.id} worker={worker} />)
          )
        ) : (
          <p className="italic text-sm">No services found.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export const getServerSideProps = async ({ req, res }) => {
  const authToken = getCookie("auth-token", { req, res });

  const { userId } = jwt.verify(authToken, "your-secret-key");

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (user.role !== "client") {
    return {
      redirect: {
        destination: "/dashboard/worker",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default Dashboard;
