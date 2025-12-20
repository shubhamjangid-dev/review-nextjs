"use client";
import React, { useEffect, useState } from "react";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { signUpSchema } from "@/schamas/signUpScheam";
import { ApiResponse } from "@/types/ApiResponse";

import { Form, FormField, FormLabel, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { GoogleOAuthButton } from "@/components/GoogleOAuth";

function Page() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingusername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounced = useDebounceCallback(setUsername, 300);

  const { toast } = useToast();
  const router = useRouter();

  // zod
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`);
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message ?? "Error while checking username");
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data);
      toast({
        title: "success",
        description: response.data.message,
        variant: "success",
      });
      router.replace(`/verify/${username}`);
    } catch (error) {
      console.log("ERROR :: sign up of user :: ");
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "SignUp Failed",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join <span style={{ color: "#23374c" }}>Re</span>
            <span style={{ color: "#e69a3f" }}>v</span>
            <span style={{ color: "#23374c" }}>iew</span>
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    placeholder="Username"
                    {...field}
                    onChange={e => {
                      //   setIsCheckingUsername(true);
                      //   setUsernameMessage("");
                      field.onChange(e);
                      debounced(e.target.value);
                    }}
                  />
                  {isCheckingusername && <Loader2 className="animate-spin" />}
                  <p className="text-sm text-green-500">{usernameMessage}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input
                    {...field}
                    name="email"
                    placeholder="Email"
                  />
                  <p className="text-muted text-zinc-500 text-sm px-2">We will send you a verification code</p>
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
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>
        <GoogleOAuthButton text="Sign up with Google" />
        <div className="text-center mt-4">
          <p>
            Already a member?{" "}
            <Link
              href="/sign-in"
              className="text-blue-600 hover:text-blue-800"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Page;
