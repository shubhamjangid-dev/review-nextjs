import React from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {CollectionResponse } from "@/types/ApiResponse";

type CollectionCardProps = {
  collection: CollectionResponse;
  onClickRedirect: (collectionId: string) => void;
};

const CollectionCard = ({ collection, onClickRedirect }: CollectionCardProps) => {
  //   const date = new Date(message.createdAt);

  return (
    <Card
      className="cursor-pointer transition-colors duration-200 hover:bg-muted"
      onClick={() => {
        onClickRedirect(collection._id);
      }}
    >
      <div className="relative">
        <CardHeader>
          <div className="flex justify-between items-center">
            {collection.unreadMessageCount > 0 && (
              <div className="absolute -top-2 -left-2 bg-red-500 rounded-full  flex items-center justify-center text-white px-2">{collection.unreadMessageCount}</div>
            )}
            <CardTitle className="text-lg">{collection.collectionName}</CardTitle>
          </div>
          <CardDescription>Number of messages : {collection.messageCount}</CardDescription>
        </CardHeader>
      </div>
    </Card>
  );
};

export default CollectionCard;
