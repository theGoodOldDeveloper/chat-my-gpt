import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";
export default handleAuth({
  signup: handleLogin({
    autorizationParams: {
      screen_hint: "signup",
    },
  }),
});
