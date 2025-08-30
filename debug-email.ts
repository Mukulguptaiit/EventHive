// Quick test file to verify Resend API configuration
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmailConfig() {
  try {
    console.log("Testing Resend API configuration...");
    console.log("API Key exists:", !!process.env.RESEND_API_KEY);
    console.log("API Key format:", process.env.RESEND_API_KEY?.substring(0, 5) + "...");
    
    // Just test the API key validity without sending
    const result = await resend.emails.send({
      from: "EventHive <noreply@krishkoria.com>",
      to: ["test@example.com"], // This won't actually send
      subject: "Test",
      html: "<p>Test</p>",
    });
    
    console.log("Test result:", result);
  } catch (error) {
    console.error("Email test error:", error);
  }
}

// Uncomment to test
// testEmailConfig();

export {};
