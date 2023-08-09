import { Label } from "@radix-ui/react-label";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import DashboardLayout from "@/components/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { projectsColumns, ProjectsTable } from "@/components/projects-table";

const WorkerDashboard = () => {
  const { data: user, isLoading } = useQuery(["user"], async () => {
    const response = await axios.get("/api/auth/me");

    return response.data;
  });

  const { data: projects, isLoading: projectsLoading } = useQuery(
    ["projects", user?.id],
    async () => {
      const response = await axios.get("/api/projects");
      return response.data;
    },
    {
      enabled: !!user,
    }
  );

  return (
    <DashboardLayout role={user?.role}>
      <section className="flex flex-col items-center col-span-full h-fit">
        <div className="flex flex-col justify-center items-center">
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
      <div className="col-span-full flex justify-center">
        {!projectsLoading && !isLoading ? (
          <ProjectsTable
            data={projects.filter(
              (project) =>
                (project.status === "pending" ||
                  project.status === "inProgress") &&
                project.workerId === user.id
            )}
            columns={projectsColumns}
            filter={["dateFinished", "worker"]}
          />
        ) : (
          <Skeleton className="h-[300px] w-[850px] " />
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkerDashboard;
