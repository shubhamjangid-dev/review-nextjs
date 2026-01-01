"use client";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse, CollectionResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCcw } from "lucide-react";
import CollectionCard from "@/components/CollectionCard";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Page = () => {
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  const { toast } = useToast();
  const router = useRouter();

  const { data: session, status } = useSession();

  const fetchCollections = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>("/api/get-collections");
        setCollections(response.data.collections || []);

        if (refresh) {
          toast({
            title: "Refreshed Collections",
            description: "Showing all collections",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description: axiosError.response?.data.message || "Failed to fetch collections",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setCollections, toast]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchCollections();
  }, [session, fetchCollections]);

  const createCollection = async () => {
    setIsCreating(true);
    try {
      if (collectionName != "") {
        await axios.post<ApiResponse>("/api/create-collection", { collectionName });
        await fetchCollections();
        setCollectionName("");
      } else {
        toast({
          title: "Error",
          description: "Collection name cannot be empty",
          variant: "destructive",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to create collections",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // const username = session?.user.username;

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
      <h1 className="text-4xl font-bold mb-4">{session.user.username}&apos;s Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Create a new Collection</h2>{" "}
        <div className="flex items-center">
          <Input
            type="text"
            className="input input-bordered w-full p-2 mr-2"
            placeholder="Enter new Collection Name"
            onChange={e => {
              setCollectionName(e.target.value);
            }}
            value={collectionName}
          />
          <Button onClick={createCollection}>{isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}</Button>
        </div>
      </div>

      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={e => {
          e.preventDefault();
          fetchCollections(true);
        }}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="space-y-4 p-4"
            >
              <div className="h-6 w-3/4 mb-2 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-1/4 rounded bg-gray-200 animate-pulse" />
            </Card>
          ))
        ) : collections.length > 0 ? (
          collections.map(collection => (
            <CollectionCard
              collection={collection}
              key={collection._id as string}
              onClickRedirect={collectionId => {
                router.replace(`/c/${collectionId}`);
              }}
            />
          ))
        ) : (
          <Card className="col-span-full text-center py-10">
            <CardHeader>
              <h3 className="text-xl font-semibold">No collections yet ✨</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">Create your first collection to start receiving reviews.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Page;
