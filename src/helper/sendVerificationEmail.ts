import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(username: string, email: string, verificationCode: string): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "",
      to: email,
      subject: "Verification Code",
      react: VerificationEmail({ username, otp: verificationCode }),
    });
    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.log("ERROR :: Send Verification Email");
    return { success: false, message: "Failed to send Verification email" };
  }
}
