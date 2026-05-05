import { getLoggedInUser } from "@/utils/googleSso";

import { GoogleLoginButton, GoogleSignOutButton } from "./GoogleLoginButtons";

export const GoogleLoginServerContainer: React.FC = async () => {
  const { user } = await getLoggedInUser();

  if (user) {
    return <GoogleSignOutButton />;
  }

  return <GoogleLoginButton />;
};
