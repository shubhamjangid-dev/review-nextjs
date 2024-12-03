"use client";
import { useToast } from "@/hooks/use-toast";
import { verifySchema } from "@/schamas/verifyScheam";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { ApiResponse } from "@/types/ApiResponse";

const page = () => {
  const prams = useParams<{ username: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [isVerifing, setIsVerifing] = useState(false);

  // zod
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      setIsVerifing(true);
      const response = await axios.post("/api/verify-code", {
        verificationCode: data.code,
        username: prams.username,
      });
      toast({
        title: "success",
        description: response.data.message,
        variant: "success",
      });
      router.replace(`/sign-in`);
    } catch (error) {
      console.log("error ", error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsVerifing(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Verify Account </h1>
          <p className="mb-4">Enter verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form
            className="space-y-8"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <FormField
                name="code"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Verification Code</FormLabel>
                    {/* <Input
                    placeholder="Verification Code"
                    {...field}
                  /> */}
                    <InputOTP
                      maxLength={6}
                      {...field}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
            >
              {isVerifing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifing
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default page;
