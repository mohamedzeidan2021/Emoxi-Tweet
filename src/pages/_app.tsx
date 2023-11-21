import { type AppType } from "next/app";
import { ClerkProvider } from '@clerk/nextjs'
import { api } from "~/utils/api";
import {Toaster} from "react-hot-toast";
import Head from "next/head";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ClerkProvider {...pageProps}>
        <Head>
          <title>Emoxi</title>
          <meta name="description" content="💭" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Toaster position="bottom-center"/>
        <Component {...pageProps} />
      </ClerkProvider>
    </>
  );
  
};

export default api.withTRPC(MyApp);
