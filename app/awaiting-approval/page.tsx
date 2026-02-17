export default function AwaitingApprovalPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md bg-white rounded-xl shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Account Pending Approval
          </h1>
  
          <p className="text-gray-700 mb-6">
            Your account has been created but requires approval
            from SunCity before pricing access is enabled.
          </p>
  
          <p className="text-sm text-gray-500">
            If you believe this is taking too long, please contact
            SunCity directly.
          </p>
        </div>
      </div>
    );
  }
  