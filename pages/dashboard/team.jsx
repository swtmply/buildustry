import DashboardLayout from "@/components/dashboard-layout";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import WorkerProfileDialog from "@/components/worker-profile-dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { projectsColumns, ProjectsTable } from "@/components/projects-table";

const Team = () => {
  const [laborers, setLaborers] = useState([]);
  const [contractors, setContractors] = useState([]);
  const { data: user, isLoading } = useQuery(
    ["user"],
    async () => {
      const response = await axios.get("/api/auth/me");

      return response.data;
    },
    {
      onSuccess(response) {
        if (response.ledTeam) {
          setLaborers(
            response.ledTeam?.workers.filter(
              (team) => team.worker.role === "laborer"
            )
          );
        }
        if (response.ledTeam) {
          setContractors(
            response.ledTeam?.workers.filter(
              (team) => team.worker.role === "contractor"
            )
          );
        }
      },
    }
  );

  const { data: users, isLoading: usersLoading } = useQuery(
    ["users"],
    async () => {
      const response = await axios.get("/api/users");
      return response.data;
    }
  );

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
        <Label className="text-2xl font-bold text-slate-900">My Projects</Label>
      </section>
      <div className="col-span-full flex justify-center">
        {!projectsLoading && !isLoading ? (
          <ProjectsTable
            data={projects.filter(
              (project) =>
                (project.status === "pending" ||
                  project.status === "inProgress") &&
                project.clientId === user.id &&
                project.estimationCost !== 0
            )}
            columns={projectsColumns}
            filter={["dateFinished", "worker"]}
          />
        ) : (
          <Skeleton className="h-[300px] w-[850px] " />
        )}
      </div>

      <section className="flex flex-col items-center col-span-full h-fit">
        <Label className="text-2xl font-bold text-slate-900">My Team</Label>
      </section>
      <section className="flex flex-col items-center col-span-full h-fit">
        <div className="flex gap-4">
          {usersLoading ? (
            <>
              <Skeleton className="h-[300px] w-[18rem]" />
              <Skeleton className="h-[300px] w-[18rem]" />
            </>
          ) : (
            <>
              <Card className="min-w-[18rem]">
                <CardHeader className="font-bold text-lg">
                  Contractors
                </CardHeader>
                <CardContent className="space-y-3">
                  {contractors.map((team, index) => {
                    return (
                      <div
                        className="flex justify-between items-center gap-4"
                        key={index}
                      >
                        <div>
                          <p>{team.worker.name}</p>
                        </div>
                        <WorkerProfileDialog worker={team.worker}>
                          <Button variant="outline" className="flex gap-2">
                            <Eye size={24} strokeWidth={1.5} />
                            <span>View</span>
                          </Button>
                        </WorkerProfileDialog>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              <Card className="min-w-[18rem]">
                <CardHeader className="font-bold text-lg">Laborers</CardHeader>
                <CardContent className="space-y-3">
                  {laborers.map((team, index) => {
                    return (
                      <div
                        className="flex justify-between items-center gap-4"
                        key={index}
                      >
                        <div>
                          <p>{`${team.worker.firstName} ${team.worker.lastName}`}</p>
                        </div>
                        <WorkerProfileDialog worker={team.worker}>
                          <Button variant="outline" className="flex gap-2">
                            <Eye size={24} strokeWidth={1.5} />
                            <span>View</span>
                          </Button>
                        </WorkerProfileDialog>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default Team;
