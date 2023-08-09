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
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";

const formSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }).max(50),
});

export default function Home() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { mutate } = useMutation(
    async (values) => {
      const response = await axios.post("/api/auth/login", {
        identifier: values.username,
        password: values.password,
      });

      return response;
    },
    {
      onSuccess: (response) => {
        if (response.data.message) {
          form.setError("username", response.data);
        } else {
          router.push("/dashboard");
        }
      },
    }
  );

  function onSubmit(values) {
    mutate(values);
  }

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
            <CardTitle className=" font-bold text-2xl">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <FormInput
                  form={form}
                  name="username"
                  label="Username"
                  placeholder="Username"
                />
                <FormInput
                  form={form}
                  name="password"
                  label="Password"
                  placeholder="Password"
                  type="password"
                />
                <Button className="bg-emerald-500 w-full mt-4" type="submit">
                  Login
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p>
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="text-emerald-500 font-semibold">
                Register Now
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
