import Head from "next/head";
import { type NextPage } from "next";

const SinglePostPage: NextPage = () => {

  return (
    <>
      <Head>
        <title>Post</title>
        <meta name="description" content="Generated by create-t3-app" />
      </Head>
      <main className="flex h-screen justify-center bg-black text-slate-100">
        <div>Post View</div>
      </main>
    </>
  );
}

export default SinglePostPage;