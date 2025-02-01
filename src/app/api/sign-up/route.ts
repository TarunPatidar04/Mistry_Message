import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();

    const exitsingUserVerifiedByUserName = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (exitsingUserVerifiedByUserName) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: 400,
        }
      );
    }

    const exitsingUserVerifiedByEmail = await UserModel.findOne({
      email,
      //   isVerified: true,
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("verifyCode  : ", verifyCode);

    if (exitsingUserVerifiedByEmail) {
      if (exitsingUserVerifiedByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User  already exists with this email",
          },
          {
            status: 400,
          }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        exitsingUserVerifiedByEmail.password = hashedPassword;
        exitsingUserVerifiedByEmail.verifyCode = verifyCode;
        exitsingUserVerifiedByEmail.verifyCodeExpiry = new Date(
          Date.now() + 3600000
        );
        await exitsingUserVerifiedByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    // Send Verification Email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    console.log("emailResponse : ", emailResponse);

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User Register Successfully. Please verify your email",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error Registering User ", error);
    return Response.json(
      {
        success: false,
        message: "Error Registering User",
      },
      {
        status: 500,
      }
    );
  }
}
