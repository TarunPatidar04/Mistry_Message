import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };

    // Validate with zod
    const result = UsernameQuerySchema.safeParse(queryParams);
    console.log("Safe Parse Result: ", result);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      console.log("usernameErrors : ", usernameErrors);
      return Response.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid Query Parameters",
          errors: usernameErrors,
        },
        { status: 400 }
      );
    }
    const { username } = result.data;
    console.log("Username query: " + username);

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is Unique",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error Checking user name ", error);
    return Response.json(
      {
        success: false,
        message: "Error Checking user name ",
      },
      {
        status: 500,
      }
    );
  }
}
