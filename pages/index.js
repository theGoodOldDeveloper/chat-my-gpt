import Head from "next/head";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getSession } from "@auth0/nextjs-auth0";

export default function Home() {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <>
      <Head>
        <title>Peter Chat 👀 Login SignUp</title>
      </Head>

      <div className="flex min-h-screen w-full items-center justify-center bg-sky-700 text-center text-orange-200 ">
        <div className="">
          {!!user && <Link href="/api/auth/logout">Logout</Link>}
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
