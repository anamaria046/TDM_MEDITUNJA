import Brand from "../components/Brand/Brand.jsx";
import LoginForm from "../components/LoginForm/LoginForm.jsx";

function Login({ initialMode = "user" }) {
    return (
        <div>
            <Brand />
            <LoginForm initialMode={initialMode} />
        </div>
    );
}

export default Login