import { SignUp } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Activity, TrendingUp } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">PowerWatch</h1>
          </div>
          <p className="text-gray-600 text-lg">Join the future of UPS monitoring</p>
        </div>

        {/* Sign Up Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Start monitoring your UPS systems with AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors",
                  card: "shadow-none border-0 bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: 
                    "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors border border-gray-300",
                  dividerLine: "bg-gray-300",
                  dividerText: "text-gray-500 text-sm",
                  formFieldInput: 
                    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
                  formFieldLabel: "text-gray-700 font-medium text-sm mb-2 block",
                  footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
                  formFieldAction: "text-blue-600 hover:text-blue-700 text-sm font-medium",
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg backdrop-blur-sm">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-700">Real-time monitoring & alerts</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg backdrop-blur-sm">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">AI failure predictions</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg backdrop-blur-sm">
            <Activity className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-gray-700">Professional analytics</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg backdrop-blur-sm">
            <Shield className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-gray-700">Enterprise-grade security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
