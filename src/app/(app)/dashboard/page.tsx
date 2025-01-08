"use client";
import { useToast } from "@/hooks/use-toast";
import { Collection } from "@/model/Collection.model";
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
import { Loader2, RefreshCcw } from "lucide-react";
import MessageCard from "@/components/MessageCard";
import CollectionCard from "@/components/CollectionCard";
import { useRouter } from "next/navigation";

const Page = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [collectionName, setCollectionName] = useState("");

  const { toast } = useToast();
  const router = useRouter();

  const handleDeleteCollection = (collectionId: string) => {
    setCollections(collections.filter(collection => collection._id !== collectionId));
  };

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

  const username = session?.user.username;

  const createCollection = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/create-collection", { collectionName });
    } catch (error) {}
  };
  if (!session || !session.user) return <>please login</>;

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

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
          <Button onClick={createCollection}>Create</Button>
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
              onCollectionDelete={handleDeleteCollection}
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
