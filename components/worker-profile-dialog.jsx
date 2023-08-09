import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Separator } from "./ui/separator";
import ProjectRequestDialog from "./project-request-dialog";
import WorkerPortfolio from "./worker-portfolio";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "./ui/button";
import { Send, Star, UserCircle2 } from "lucide-react";
import Link from "next/link";
import FormTextArea from "./form-text-area";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormLabel } from "./ui/form";
import ServiceList from "./service-list";
import FormInput from "./form-input";
import { ScrollArea } from "./ui/scroll-area";

const contractorProfileSchema = z.object({
  description: z.string(),
  location: z.string(),
});

const WorkerProfileDialog = ({
  children,
  worker,
  onDropdown,
  dropdownMenu,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {onDropdown && dropdownMenu}

      {!onDropdown && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="max-w-xl">
        <ScrollArea className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Worker Profile</DialogTitle>
          </DialogHeader>
          <WorkerProfileContent worker={worker} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export const WorkerProfileContent = ({ worker }) => {
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(contractorProfileSchema),
    defaultValues: {
      description: worker.contractor ? worker.contractor.description : "",
      location: worker.contractor ? worker.contractor.location : "",
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const { data: user } = useQuery(["user"], async () => {
    const response = await axios.get("/api/auth/me");

    return response.data;
  });

  const { data: portfolio, isLoading } = useQuery(
    ["portfolio", worker.id],
    async () => {
      return (await axios.get(`/api/users/${worker.id}/portfolio`)).data;
    }
  );

  const { mutate } = useMutation({
    mutationFn: async (values) => {
      return await axios.put(`/api/users/${worker.id}`, values);
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries(["user"]);
    },
  });

  const userIsWorker = user?.id === worker.id;

  function onSubmit(values) {
    mutate(values);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-between">
        <div className="flex gap-4">
          <div className="w-40 aspect-square relative">
            <UserCircle2 size={150} strokeWidth={1} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold text-emerald-500">{worker.name}</p>
            <div>
              <p className="text-slate-500">{worker.email}</p>
              <p className="text-slate-500">{worker.contactNumber}</p>
            </div>
            <div className="flex gap-1 items-center">
              <Star size={24} className="fill-yellow-500 text-transparent" />
              <p className="font-semibold text-sm">
                {(
                  worker.rating / worker.ratingCount ||
                  0 / worker.ratingCount ||
                  0
                ).toFixed(1)}
              </p>
              <p className="text-xs text-slate-500">{`(${worker.ratingCount} Reviews)`}</p>
            </div>
            {!userIsWorker && (
              <div className="flex gap-2">
                <ProjectRequestDialog role={worker.role} worker={worker}>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    Request Service
                  </Button>
                </ProjectRequestDialog>
                <Link
                  href={`/dashboard/messages/${worker.id}`}
                  variant="outline"
                  className="flex items-center text-sm gap-2 h-9 px-4 py-2 border border-input bg-background shadow-sm rounded-md hover:bg-accent hover:text-accent-foreground"
                >
                  <Send strokeWidth={1} size={16} className="mt-1" />
                  <span>Message</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {worker.role === "contractor" ? (
        <>
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => {
              if (!isEditing) {
                setIsEditing(true);
              } else {
                onSubmit(form.getValues());
              }
            }}
            type={isEditing ? "submit" : "button"}
          >
            {isEditing ? "Save Changes" : "Edit Details"}
          </Button>
          {isEditing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-2"
              >
                <FormInput
                  form={form}
                  name="location"
                  label="Location"
                  placeholder="Location"
                />
                <FormTextArea
                  form={form}
                  name="description"
                  label="Details"
                  placeholder="Details"
                />
              </form>
            </Form>
          ) : (
            <>
              <div className="flex-col">
                <span className="text-sm font-bold">Location: </span>
                <p>{worker.contractor ? worker.contractor.location : ""}</p>
              </div>
              <div className="flex-col">
                <span className="text-sm font-bold">Details: </span>
                <p>{worker.contractor ? worker.contractor.description : ""}</p>
              </div>
              <div className="flex-col">
                <span className="text-sm font-bold">Services: </span>
                <ServiceList
                  services={
                    worker.contractor.servicesOffered
                      ? worker.contractor.servicesOffered
                      : []
                  }
                />
              </div>
            </>
          )}
        </>
      ) : null}
      <Separator />
      <DialogTitle>Projects Done</DialogTitle>
      {!isLoading && (
        <WorkerPortfolio portfolio={portfolio} userIsWorker={userIsWorker} />
      )}
    </div>
  );
};

export default WorkerProfileDialog;
