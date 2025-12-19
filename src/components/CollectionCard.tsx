import React from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { ApiResponse, CollectionResponse } from "@/types/ApiResponse";
import { Trash2 } from "lucide-react";

type CollectionCardProps = {
  collection: CollectionResponse;
  onCollectionDelete: (collectionId: string) => void;
  onClickRedirect: (collectionId: string) => void;
};

const CollectionCard = ({ collection, onCollectionDelete, onClickRedirect }: CollectionCardProps) => {
  const { toast } = useToast();
  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete<ApiResponse>(`/api/delete-collection/${collection._id}`);
      toast({
        title: response.data.message,
      });
      onCollectionDelete(collection._id as string);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    }
  };
  //   const date = new Date(message.createdAt);

  return (
    <Card
      onClick={e => {
        const target = e.target as HTMLElement;
        if (target.tagName != "BUTTON") onClickRedirect(collection._id as string);
      }}
    >
      <div className="relative">
        <CardHeader>
          <div className="flex justify-between items-center">
            {collection.unreadMessageCount > 0 && (
              <div className="absolute -top-2 -left-2 bg-red-500 rounded-full  flex items-center justify-center text-white px-2">{collection.unreadMessageCount}</div>
            )}
            <CardTitle className="text-lg">{collection.collectionName}</CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete all message inside this collection and remove your data from our servers.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <CardDescription>Number of messages : {collection.messageCount}</CardDescription>
        </CardHeader>
      </div>
    </Card>
  );
};

export default CollectionCard;
