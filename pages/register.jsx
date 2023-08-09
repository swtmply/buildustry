import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import FormInput from "@/components/form-input";
import FormSelect from "@/components/form-select";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { useRouter } from "next/router";
import { services } from "@/lib/services";
import { useEffect } from "react";

const formSchema = z
  .object({
    username: z.string().min(3, { message: "Username is required" }),
    email: z.string().email(),
    name: z.string().min(3, { message: "Name is required" }),
    contactNumber: z
      .string()
      .min(11, { message: "Contact Number is required" }),
    role: z.string(),
    laborType: z.string(),
    password: z.string().min(8, { message: "Password is too short" }).max(50),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password don't match",
  });

export default function Register() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      contactNumber: "",
      email: "",
      role: "client",
      password: "",
      confirmPassword: "",
      laborType: "electrician",
    },
  });

  const { toast } = useToast();

  const { mutate } = useMutation(async (values) => {
    const response = await axios.post("/api/auth/register", values);

    if (response) {
      //TODO: go to login
      toast({
        title: "User creation",
        description: response.data.message,
      });
      router.push("/");
    }
  });

  function onSubmit(values) {
    mutate(values);
  }

  useEffect(() => {
    console.log(form.getValues());
  }, [form]);

  return (
    <main className="min-h-screen flex">
      <div className="w-1/2 min-h-full relative">
        <Image src="/images/building.jpg" alt="Building" fill />
      </div>
      <div className="w-1/2 min-h-full flex flex-col justify-center items-center">
        <h1 className="uppercase text-emerald-500 font-black tracking-tight text-4xl mb-4">
          Buildustry
        </h1>
        <Card className="min-w-[400px]">
          <CardHeader>
            <CardTitle className=" font-bold text-2xl">Register</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-2"
              >
                <FormSelect
                  form={form}
                  name="role"
                  label="Role"
                  placeholder="Role"
                  options={[
                    { label: "Client", value: "client" },
                    { label: "Laborer", value: "laborer" },
                    { label: "Contractor", value: "contractor" },
                  ]}
                />
                {form.watch("role") === "laborer" && (
                  <FormSelect
                    form={form}
                    name="laborType"
                    label="Job"
                    placeholder="Job"
                    options={services}
                  />
                )}
                <FormInput
                  form={form}
                  name="name"
                  label={
                    form.watch("role") === "contractor"
                      ? "Company Name"
                      : "Full Name"
                  }
                  placeholder={
                    form.watch("role") === "contractor"
                      ? "Company Name"
                      : "Full Name"
                  }
                />
                <FormInput
                  form={form}
                  name="username"
                  label="Username"
                  placeholder="Username"
                />
                <FormInput
                  form={form}
                  name="email"
                  label="Email"
                  placeholder="Email"
                />
                <FormInput
                  form={form}
                  name="contactNumber"
                  label="Contact Number"
                  placeholder="Contact Number"
                />
                <FormInput
                  form={form}
                  name="password"
                  label="Password"
                  placeholder="Password"
                  type="password"
                />
                <FormInput
                  form={form}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  type="password"
                />
                <Button className="bg-emerald-500 w-full mt-4" type="submit">
                  Register
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p>
              Already a user?{" "}
              <Link href="/" className="text-emerald-500 font-semibold">
                Login Here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
