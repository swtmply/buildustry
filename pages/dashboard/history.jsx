import DashboardLayout from "@/components/dashboard-layout";
import { ProjectsTable, projectsColumns } from "@/components/projects-table";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const jobs = [
  {
    name: "Website Design",
    dateFinished: new Date("2023-07-11"),
    worker: {
      name: "John Smith",
      role: "contractor",
    },
    service: "Web Design",
    status: "completed",
  },
  {
    name: "App Development",
    dateFinished: new Date("2023-07-12"),
    worker: {
      name: "Jane Smith",
      role: "contractor",
    },
    service: "App Development",
    status: "pending",
  },
  {
    name: "Graphic Design",
    dateFinished: new Date("2023-07-13"),
    worker: {
      name: "John Doe",
      role: "laborer",
    },
    service: "Graphic Design",
    status: "completed",
  },
];

const History = () => {
  const { data: user, isLoading } = useQuery(["user"], async () => {
    const response = await axios.get("/api/auth/me");

    return response.data;
  });

  const { data: projects, isLoading: projectsLoading } = useQuery(
    ["projects", user.id],
    async () => {
      const response = await axios.get("/api/projects");
      return response.data;
    }
  );

  return (
    <DashboardLayout role={user?.role}>
      <section className="flex flex-col items-center col-span-full h-fit">
        <section className="flex flex-col items-center col-span-full h-fit">
          <Label className="text-2xl font-bold text-slate-900">
            Recent Projects
          </Label>
        </section>
      </section>
      <div className="col-span-full flex justify-center">
        {!projectsLoading && !isLoading ? (
          <ProjectsTable
            data={projects.filter(
              (project) =>
                project.status === "completed" || project.status === "cancelled"
            )}
            columns={projectsColumns}
            filter={[]}
            history={true}
          />
        ) : (
          <Skeleton className="h-[300px] w-[850px] " />
        )}
      </div>
    </DashboardLayout>
  );
};

export default History;
