import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn({ setUserId }: { setUserId: (userId: string) => void }) {
  return (
    <>
      <PageMeta
        title="EzLearn - Đăng nhập"
        description="EzLearn - Đăng nhập"
      />
      <AuthLayout>
        <SignInForm setUserId={setUserId} />
      </AuthLayout>
    </>
  );
}
