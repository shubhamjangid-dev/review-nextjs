"use client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/Collection.model";
import { acceptMessageSchema } from "@/schamas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCcw, Trash2 } from "lucide-react";
import MessageCard from "@/components/MessageCard";
import { useParams } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useRouter } from "next/navigation";

const Page = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [link, setLink] = useState("");
  const { collectionId } = useParams<{ collectionId: string }>();

  const { toast } = useToast();
  const router = useRouter();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter(message => message._id !== messageId));
  };

  const handleDeleteCollection = async () => {
    try {
      const response = await axios.delete<ApiResponse>(`/api/delete-collection/${collectionId}`);
      router.replace("/dashboard");
      toast({
        title: response.data.message,
        variant: "success",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    }
  };

  const { data: session, status } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>(`/api/accept-messages?collectionId=${collectionId}`);
      setValue("acceptMessages", response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to fetch message settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast, collectionId]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>(`/api/get-messages?collectionId=${collectionId}`);
        setMessages(response.data.messages || []);
        setCollectionName(response.data.collectionName || "");
        setLink(response.data.link || "");

        if (refresh) {
          toast({
            title: "Refreshed messages",
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description: axiosError.response?.data.message || "Failed to fetch messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setMessages, toast, collectionId]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessage();
  }, [session, setValue, fetchAcceptMessage, fetchMessages]);

  const handleSwitchToggel = async () => {
    setIsSwitchLoading(true);

    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        isAcceptingMessages: !acceptMessages,
        collectionId,
      });
      setValue("acceptMessages", !acceptMessages);
      toast({
        title: response.data.message,
        variant: "success",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to toggel accept messages",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  };
  const resetLink = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/reset-link", {
        collectionId,
      });

      setLink(response.data.link as string);
      toast({
        title: response.data.message,
        variant: "success",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to toggel accept messages",
        variant: "destructive",
      });
    } finally {
    }
  };

  const username = session?.user.username;

  // TODO: research on how to get url like https://shubhamjangir.in  in different waya
  const profileUrl = `review.shubhamjangir.in/u/${username}/${collectionName.replace(/ /g, "%20")}/accept?token=${link}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL Copied",
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session || !session.user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <h2 className="text-2xl font-semibold">You&apos;re not logged in 🔒</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Please sign in to access your dashboard and manage your collections.</p>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="my-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold mb-4">{collectionName}</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="mb-4"
              variant="destructive"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete Collection
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete all message inside this collection and remove your data from our servers.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCollection}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <Input
            type="text"
            className="input input-bordered w-full p-2 mr-2"
            disabled
            value={profileUrl}
          />
          <Button
            className="mr-2"
            onClick={resetLink}
          >
            Reset Link
          </Button>
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchToggel}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">Accept Messages: {acceptMessages ? "On" : "Off"}</span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={e => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="space-y-4 p-4"
            >
              <div className="h-6 w-3/4 mb-2 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
            </Card>
          ))
        ) : messages.length > 0 ? (
          messages.map(message => (
            <MessageCard
              key={message._id as string}
              message={message}
              onMessageDelete={handleDeleteMessage}
              collectionId={collectionId}
            />
          ))
        ) : (
          <Card className="col-span-full text-center py-10">
            <CardHeader>
              <h3 className="text-xl font-semibold">No messages yet 💬</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Share your link to start receiving anonymous messages.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Page;
