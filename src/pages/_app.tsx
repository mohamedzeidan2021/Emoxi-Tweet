import { type AppType } from "next/app";
import { ClerkProvider } from '@clerk/nextjs'
import { api } from "~/utils/api";
import {Toaster} from "react-hot-toast";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => (
  <ClerkProvider {...pageProps}>
    <Toaster position="bottom-center"/>
    <Component {...pageProps} />
  </ClerkProvider>
);

export default api.withTRPC(MyApp);
