import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { EmojiPost } from "@prisma/client"; // Import the Post type asd
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast, {Toaster} from "react-hot-toast";
import { type NextPage } from "next";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.post.getAll.invalidate();
    },
    onError: (e) => {  
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    }
  });

  const [input, setInput] = useState("");

  console.log(user);

  if (!user) return null;

  return <div className="flex gap-3 w-full">
    <Image 
      src={user.profileImageUrl}
      alt="Profile Image" 
      className="w-14 h-14 rounded-full" 
      width={56} 
      height={56}
    />
  <input 
    placeholder="Type some emojis!" 
    className="grow bg-transparent outline-none" 
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}

    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (input !== "") {
          mutate({content: input});
        }
      }
    }}
    disabled={isPosting}
  />
  {input !== "" && !isPosting && (
    <button onClick={() => mutate({ content: input })} disabled={isPosting}>
      Post
    </button>
  )}
    
  {isPosting && 
    <div className="flex justify-center items-center">
      <LoadingSpinner />
    </div>}
  </div>
};

type PostWithUser = RouterOutputs["post"]["getAll"][number];

const PostsView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex p-4 gap-3 border-b border-slate-400">
      <Image 
        src={author.profilePicture} 
        className="h-14 w-14 rounded-full"
        alt={`@${author.username}'s profile picture`} 
        width={56} 
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <Link href={`/@${author.username}`}>
            <span>
              {`@${author.username}`}
            </span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">
              {` · ${dayjs(post.createdAt).fromNow()} `}
            </span>
          </Link>
        </div>
        <div>
          <span className="text-2xl">{post.content}</span>
        </div>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.post.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong!</div>;

  return (
  <div className="flex flex-col">
    {data.map((fullPost) => (
      <PostsView {...fullPost} key={fullPost.post.id} />
    ))}
  </div>
  )
  

}

const Home: NextPage = () => {

  const {isLoaded: userLoaded, isSignedIn } = useUser();

  //start fetching asap
  api.post.getAll.useQuery();

  //return empty div if user arent loaded
  if (!userLoaded) return <div />

  

  return (
    <main className="flex h-screen justify-center bg-black text-slate-100">
      <div className="w-full h-full md:max-w-2xl border-slate-400 border-x">
        <div className="border-b border-slate-400 p-4">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {!!isSignedIn && <CreatePostWizard />}
        </div>

        <Feed />
      </div>
    </main>
  );
}

export default Home;