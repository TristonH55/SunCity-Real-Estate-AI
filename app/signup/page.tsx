import Link from "next/link";
import CustomerOtp from "../components/CustomerOtp";

export const metadata = { title: "Sign up | SunCity Hot Water" };

// Public customer sign up. Real estate agents keep /register.
export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card-strong p-8 w-full max-w-md space-y-5">
        <div>
          <h1 className="text-2xl heading">Get your hot water quote</h1>
          <p className="text-sm text-slate-400 mt-1">
            Create your account in a few seconds.
          </p>
        </div>

        <CustomerOtp mode="signup" />

        <div className="text-sm text-slate-400 text-center space-y-1 pt-2">
          <p>
            Already have an account?{" "}
            <Link href="/login?customer=1" className="text-[#ff5a2c] font-medium hover:underline">
              Log in
            </Link>
          </p>
          <p>
            Real estate agent?{" "}
            <Link href="/register" className="text-[#ff5a2c] font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
