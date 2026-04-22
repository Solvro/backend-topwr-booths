import { DefaultAuthProvider } from "adminjs";
import type { DefaultAuthenticatePayload } from "adminjs";

import logger from "@adonisjs/core/services/logger";

import User from "#models/user";

import { componentLoader } from "./component_loader.js";

const authenticate = async ({
  email,
  password,
}: DefaultAuthenticatePayload) => {
  try {
    const user = await User.verifyCredentials(email, password);
    return {
      email: user.email,
    };
  } catch {
    logger.warn("Invalid admin panel credentials");
    return null;
  }
};

const authProvider = new DefaultAuthProvider({
  componentLoader,
  authenticate,
});

export default authProvider;
