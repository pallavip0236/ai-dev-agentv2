import SigninForm from "./signin-form";

export default function SigninPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020817] px-8 py-14">
      <div className="glass-card w-[420px] p-8 shadow-2xl border border-white/10 backdrop-blur-xl">
        <SigninForm />
      </div>
    </div>
  );
}