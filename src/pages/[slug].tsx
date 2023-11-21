import Head from "next/head";
import { type NextPage } from "next";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {

  const {data, isLoading} = api.profile.getUserByUsername.useQuery({
    username: "mohamedzeidan2021"
  });
  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex h-screen justify-center bg-black text-slate-100">
        <div>{data.username}</div>
      </main>
    </>
  );
}

export default ProfilePage;