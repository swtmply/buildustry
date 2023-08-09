import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormItem, FormLabel } from "../ui/form";
import FormInput from "../form-input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "../ui/input";
import { useState } from "react";

const newProjectSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
});

const AddPortfolioProjectForm = ({ setOpen, firstTime = false }) => {
  const [images, setImages] = useState([]);

  const { data: user } = useQuery(["user"], async () => {
    const response = await axios.get("/api/auth/me");

    return response.data;
  });

  const form = useForm({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: "",
    },
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    async (values) => {
      const uploadURL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/upload`;
      let urls = [];

      for (const image of images) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_PRESET
        );

        try {
          const response = await axios.post(uploadURL, formData);

          urls.push(response.data.url);
        } catch (error) {
          console.error(error);
        }
      }

      if (firstTime) {
        return await axios.post(`/api/users/${user.id}/portfolio`, {
          projects: [
            {
              name: values.name,
              images: urls,
            },
          ],
        });
      }

      return await axios.put(`/api/users/${user.id}/portfolio`, {
        name: values.name,
        images: urls,
      });
    },
    {
      onSuccess() {
        toast({
          title: "Project added to portfolio",
          description: "Project was added to your profile",
        });

        queryClient.invalidateQueries(["portfolio", user.id]);
        setOpen(false);
      },
    }
  );

  function onSubmit(values) {
    mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <FormInput
          form={form}
          name="name"
          label="Project Name"
          placeholder="Project Name"
        />
        <FormItem>
          <FormLabel>Images</FormLabel>
          <Input
            type="file"
            multiple={true}
            onChange={(e) => setImages(e.target.files)}
          />
        </FormItem>

        <Button
          className="bg-emerald-500 hover:bg-emerald-600 w-full mt-4"
          type="submit"
          disabled={isLoading}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default AddPortfolioProjectForm;
