import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form } from "../ui/form";
import FormInput from "../form-input";
import FormSelect from "../form-select";
import FormTextArea from "../form-text-area";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { services } from "@/lib/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Rate from "../rate";

const newProjectSchema = z.object({
  projectName: z.string().min(1, { message: "Project name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  service: z.string().optional(),
  worker: z.string().min(1, { message: "Worker is required" }),
  estimationCost: z.number(),
});

const NewProjectForm = ({ setOpen, viewOnly, role, worker, project }) => {
  const { data: user } = useQuery(["user"], async () => {
    const response = await axios.get("/api/auth/me");

    return response.data;
  });
  const form = useForm({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      projectName: project ? project.name : "",
      description: project ? project.description : "",
      service:
        worker?.role === "laborer"
          ? worker.laborType
          : project
          ? project.typeOfService
          : "",
      worker: project ? "" : worker.name,
      estimationCost: project ? project.estimationCost : 0,
    },
  });
  console.log(worker);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    async (values) => {
      await axios.post("/api/projects", {
        typeOfService: values.service,
        name: values.projectName,
        description: values.description,
        workerId: project ? "" : worker.id,
      });
    },
    {
      onSuccess() {
        toast({
          title: "Request Sent",
          description:
            "Job request has been forwarded to the person you have messaged.",
        });
        setOpen(false);
      },
    }
  );

  const { mutate: updateStatus } = useMutation(
    async (values) => {
      await axios.put(`/api/projects/${values.id}`, {
        status: values.status,
        estimationCost: parseInt(values.estimationCost),
      });
    },
    {
      onSuccess() {
        toast({
          title: "Status Changed",
          description: "Project status has been updated.",
        });
        setOpen(false);
        queryClient.invalidateQueries(["projects", user.id]);
      },
    }
  );

  const { mutate: createNotification } = useMutation(
    async (values) => {
      await axios.post(`/api/users/${user.id}/notification`, {
        title: values.title,
        content: values.content,
        userId: values.id,
      });
    },
    {
      onSuccess() {
        toast({
          title: "Notication Sent",
          description: "Notification has been sent.",
        });
        setOpen(false);
      },
    }
  );

  function onSubmit(values) {
    if (!viewOnly) {
      mutate(values);
      createNotification({
        title: "New Project Request",
        content: "You have a new project request. ",
        id: worker.id,
      });
    }
  }

  function updateProjectStatus({
    newStatus,
    estimationCost,
    notificationTitle,
    notificationContent,
  }) {
    updateStatus({
      status: newStatus,
      estimationCost: estimationCost,
      id: project.id,
    });
    createNotification({
      title: notificationTitle,
      content: notificationContent,
      id: project.clientId,
    });
  }

  function serviceOffered() {
    return worker
      ? worker.contractor.servicesOffered.map((service) => ({
          label: service.service,
          value: service.service,
        }))
      : user.contractor.servicesOffered.map((service) => ({
          label: service.service,
          value: service.service,
        }));
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <FormInput
          form={form}
          name="projectName"
          label="Project Name"
          placeholder="Project Name"
          viewOnly={viewOnly}
        />
        <FormTextArea
          form={form}
          name="description"
          label="Description"
          placeholder="Description"
          viewOnly={viewOnly}
        />
        {!project && (
          <FormInput
            form={form}
            name="worker"
            label="Worker"
            placeholder="Worker"
            viewOnly={true}
          />
        )}

        {role !== "laborer" && (
          <FormInput
            form={form}
            name="estimationCost"
            label="Estimation Cost"
            placeholder="estimation cost"
            viewOnly={user.role === "client"}
            type="number"
          />
        )}

        {role === "laborer" || !worker ? (
          <FormInput
            form={form}
            name="service"
            label="Service"
            viewOnly={true}
          />
        ) : (
          <FormSelect
            form={form}
            name="service"
            label="Service"
            placeholder="Select a Service"
            options={serviceOffered()}
            viewOnly={viewOnly}
          />
        )}
        {project ? (
          project.status === "completed" ? (
            user.role === "client" &&
            !project.isRated && (
              <Rate
                workerId={project.workerId}
                setOpen={setOpen}
                projectId={project.id}
              />
            )
          ) : project.status === "cancelled" ? null : project.status ===
              "pending" && user.role !== "client" ? (
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 w-full mt-4"
              type="button"
              onClick={() => {
                updateProjectStatus({
                  newStatus: "pending",
                  estimationCost: form.getValues("estimationCost"),
                  notificationTitle: "Estimation Cost",
                  notificationContent:
                    "Your project request has an estimation cost now. ",
                });
              }}
            >
              Send estimation cost
            </Button>
          ) : project.status !== "inProgress" &&
            project.estimationCost !== 0 &&
            user.role === "client" ? (
            <div className="flex gap-4">
              <Button
                className="bg-slate-500 hover:bg-emerald-600 w-full mt-4"
                type="button"
                onClick={() =>
                  updateProjectStatus({
                    newStatus: "cancelled",
                    estimationCost: form.getValues("estimationCost"),
                    notificationTitle: "Project Declined",
                    notificationContent: "Your project request are declined. ",
                  })
                }
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 w-full mt-4"
                type="button"
                onClick={() =>
                  updateProjectStatus({
                    newStatus: "inProgress",
                    estimationCost: form.getValues("estimationCost"),
                    notificationTitle: "Project Accepted",
                    notificationContent: "Your project request are accepted. ",
                  })
                }
              >
                Accept
              </Button>
            </div>
          ) : (
            user.role !== "client" && (
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 w-full mt-4"
                type="button"
                onClick={() =>
                  updateProjectStatus({
                    newStatus: "completed",
                    estimationCost: form.getValues("estimationCost"),
                    notificationTitle: "Project Completed",
                    notificationContent: "Your project request are completed. ",
                  })
                }
              >
                Complete
              </Button>
            )
          )
        ) : (
          <Button
            disabled={viewOnly}
            className="bg-emerald-500 hover:bg-emerald-600 w-full mt-4"
            type={viewOnly ? "button" : "submit"}
            onClick={() => viewOnly && setOpen(false)}
          >
            {viewOnly ? "Close" : "Submit"}
          </Button>
        )}
        {/* {project.status === "completed" && <Rate />} */}
      </form>
    </Form>
  );
};

export default NewProjectForm;
