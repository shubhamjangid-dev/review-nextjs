"use client";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import * as z from "zod";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { signInSchema } from "@/schamas/signInScheam";

import { Form, FormField, FormLabel, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { GoogleOAuthButton } from "@/components/GoogleOAuth";

type PageProps = {
  searchParams: {
    username?: string;
  };
};
function Page({ searchParams }: PageProps) {
  const username = searchParams.username || "";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  // zod
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: username,
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    const response = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (response?.error) {
      if (response.error === "CredentialsSignin") {
        toast({
          title: "Login Failed",
          description: "Incorrect Username or Password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "error",
          description: response.error,
          variant: "destructive",
        });
      }
    }
    setIsSubmitting(false);
    if (response?.url) {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome Back to <span style={{ color: "#23374c" }}>Re</span>
            <span style={{ color: "#e69a3f" }}>v</span>
            <span style={{ color: "#23374c" }}>iew</span>
          </h1>
          <p className="mb-4">Sign in to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <Input
                    {...field}
                    name="identifier"
                    placeholder="Email or Username"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input
                    {...field}
                    type="password"
                    name="password"
                    placeholder="Password"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
        <GoogleOAuthButton text="Sign in with Google" />
        <div className="text-center mt-4">
          <p>
            Create new account?{" "}
            <Link
              href="/sign-up"
              className="text-blue-600 hover:text-blue-800"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Page;
