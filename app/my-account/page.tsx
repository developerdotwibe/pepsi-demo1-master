import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import LoginForm from "@/app/components/Account/LoginForm";
import "./my-account.css";

export default function MyAccount() {
  return (
    <>
      <Header />

      <main className="my-account-page">
        <div className="container">
          <LoginForm />
        </div>
      </main>

      <Footer />
    </>
  );
}