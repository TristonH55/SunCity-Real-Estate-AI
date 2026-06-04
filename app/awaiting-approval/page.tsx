export default function AwaitingApprovalPage() {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md glass-card-strong p-8 text-center">
          <h1 className="text-2xl heading mb-4">
            Account Pending Approval
          </h1>

          <p className="text-slate-300 mb-6">
            Your account has been created but requires approval
            from SunCity before pricing access is enabled.
          </p>

          <p className="text-sm text-slate-500">
            If you believe this is taking too long, please contact
            SunCity directly.
          </p>
        </div>
      </div>
    );
  }
  