import Head from "next/head";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getSession } from "@auth0/nextjs-auth0";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDragon } from "@fortawesome/free-solid-svg-icons";

export default function ChatPage() {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <>
      <Head>
        <title>Peter Chat 👀 Login SignUp</title>
      </Head>

      <div className="flex min-h-screen w-full items-center justify-center bg-sky-700 text-center text-orange-200 ">
        <div>
          <div>
            <FontAwesomeIcon
              icon={faDragon}
              className="mb-3 text-7xl text-emerald-200"
            />
          </div>
          <h1 className=" text-4xl font-bold"> Welcome to Chat G. Peter</h1>
          <h2 className=" text-2xl text-emerald-200">
            {" "}
            AI Assistant of theGoodOldDeveloper
          </h2>
          <p className=" mt-3 text-lg text-emerald-200">
            {" "}
            Log in with your to continue...
          </p>
          <div className="mt-5">
            {/* {!!user && <Link href="/api/auth/logout">Logout</Link>} */}
            {!user && (
              <>
                <Link
                  href="/api/auth/login"
                  className=" rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
                >
                  Login
                </Link>
                <Link
                  href="/api/auth/signup"
                  className="hover: mx-2 rounded-md bg-rose-400 px-4 py-2 hover:bg-rose-600 "
                >
                  SignUp
                </Link>
              </>
            )}
            {/* <Link href="/api/auth/login ">Login</Link> */}
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req, ctx.res);
  if (!!session) {
    return {
      redirect: {
        destination: "/chat",
      },
    };
  }

  return {
    props: {},
  };
};
