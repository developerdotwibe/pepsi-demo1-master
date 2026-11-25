import Header from "@/app/components/header/Header";
import Footer from "@/app/components/footer/Footer";
import RegisterForm from "@/app/components/Account/RegisterForm";
import "../my-account/my-account.css";

export default function Register() {
  return (
    <>
      <Header />

      <main className="my-account-page">
        <div className="container">
          <RegisterForm />
        </div>
      </main>

      <Footer />
    </>
  );
}