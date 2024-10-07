"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

function page() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user.username} <br />
        <button
          className="bg-red-500 px-3 py-1 m-4 rounded"
          onClick={() => {
            signIn();
          }}
        >
          Sign Out
        </button>
      </>
    );
  } else {
    return (
      <>
        Not Signed In <br />
        <button
          className="bg-white text-black px-3 py-1 m-4 rounded"
          onClick={() => {
            signOut();
          }}
        >
          Sign In
        </button>
      </>
    );
  }
  return <div>page</div>;
}

export default page;
