import { type NextPage } from "next";
import Head from "next/head";
import React from 'react'
import { api } from "@/utils";
import { useZodForm } from "@/utils";
import { Courier, Department } from "@prisma/client";
import { z } from "zod";
import { Controller } from "react-hook-form";
import { Input, Label, Select, SelectContent, SelectTrigger, SelectValue, SelectGroup, SelectItem, Button, Tabs, TabsList, TabsTrigger, TabsContent, } from "@/ui";
import{ Pending, Delivered, ShipmentError} from "@/ui/components"
import Pagination from "rc-pagination";
import 'rc-pagination/assets/index.css'
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AppContainer, { filters, shipmentCreateSchema } from "@/ui/components/AppContainer";


const Home: NextPage = () => {
  const { data: session } = useSession();
  return (
    <>
      <Head>
        <title>Shipment Tracker</title>
        <meta name="description" content="Shipment Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen w-screen flex-col items-center bg-gradient-to-b from-slate-200 to-white pt-8">
        {!session ? (
          <Button onClick={() => signIn()}>Sign in</Button>
        ) : (
          <AppContainer />
        )}
      </main>  </>
  );
};

export default Home;
