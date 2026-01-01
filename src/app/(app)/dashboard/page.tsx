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

const Page = () => {
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  const { toast } = useToast();
  const router = useRouter();


  const { data: session } = useSession();

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

  if (!session || !session.user) return <>please login</>;

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
        {collections.length > 0 ? (
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
          <p>Create your first collection</p>
        )}
      </div>
    </div>
  );
};

export default Page;
