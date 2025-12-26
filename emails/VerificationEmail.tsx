import Image from "next/image";
import React from "react";

interface VerificationEmailProps {
  username: string;
  otp: string;
}

const VerificationEmail: React.FC<VerificationEmailProps> = ({ username, otp }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "400px",
          backgroundColor: "white",
          // boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          padding: "20px",
          textAlign: "center",
          border: "1px solid #ccc",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: "28px", fontWeight: "bold" }}>
          <Image
            src="/Logo.jpeg"
            alt="Logo"
            style={{ height: "50px", marginRight: "5px" }}
          />
          <span style={{ color: "#23374c" }}>Re</span>
          <span style={{ color: "#e69a3f" }}>v</span>
          <span style={{ color: "#23374c" }}>iew</span>
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#23374c", marginTop: "10px" }}>Hello {username},</h2>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#23374c" }}>Verify your Review sign-up</h3>
        <p style={{ fontSize: "14px", color: "#666", margin: "15px 0" }}>
          We have received a sign-up attempt with the following code. Please enter it in the browser window where you started signing up for the Review website.
        </p>
        <div style={{ display: "inline-block", fontSize: "24px", fontWeight: "bold", backgroundColor: "#23374c", color: "#e69a3f", padding: "10px 20px", borderRadius: "5px", margin: "15px 0" }}>
          {otp}
        </div>
        <p style={{ fontSize: "12px", color: "#888", marginTop: "10px" }}>If you did not attempt to sign up but received this email, please disregard it. The code will remain active for 5 minutes.</p>
        <a href={`http://shubhamjangir.in/verify/${username}`}>
          <button style={{ color: "#61dafb" }}>Click here to verify</button>
        </a>
      </div>
    </div>
  );
};

export default VerificationEmail;
