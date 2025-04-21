import {useAuth} from './contexts/useAuth';

const LoginRegister = () => {
    const {
        login,
        loginUsernameRef,
        loginPasswordRef,
        register,
        registerUsernameRef,
        registerPasswordRef,
    } = useAuth();

    async function handleLogin(event) {
        event.preventDefault();
        login(loginUsernameRef.current.value, loginPasswordRef.current.value);
    }

    async function handleRegister(event) {
        event.preventDefault();
        register(registerUsernameRef.current.value, registerPasswordRef.current.value);
    }

    return (
        <>
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-full max-w-4xl bg-white rounded-lg p-6 ring-8 ring-white ring-opacity-40">
                    {/* Welcome Message */}
                    <h1 className="text-3xl font-semibold text-center mb-8">Welcome to Skymet</h1>

                    {/* Forms Container */}
                    <div className="flex bg-white rounded-lg ring-8 ring-white ring-opacity-40">
                        {/* Login Form */}
                        <div className="w-1/2 p-6 border-r border-gray-200">
                            <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label
                                        htmlFor="login-username"
                                        className="w-1/3 text-md text-gray-700"
                                    >
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        ref={loginUsernameRef}
                                        className="w-2/3 px-2 py-1 border rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label
                                        htmlFor="login-password"
                                        className="w-1/3 text-md text-gray-700"
                                    >
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        ref={loginPasswordRef}
                                        className="w-2/3 px-2 py-1 border rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className='items-center text-center'>
                                    <button
                                        type="submit"
                                        className="w-24 p-2 bg-blue-400 text-white text-center rounded-md hover:bg-blue-700"
                                    >
                                        Login
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Register Form */}
                        <div className="w-1/2 p-6">
                            <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label
                                        htmlFor="register-username"
                                        className="w-1/3 text-md text-gray-700"
                                    >
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        ref={registerUsernameRef}
                                        className="w-2/3 px-2 py-1 border rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label
                                        htmlFor="register-password"
                                        className="w-1/3 text-md text-gray-700"
                                    >
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        ref={registerPasswordRef}
                                        className="w-2/3 px-2 py-1 border rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className='items-center text-center'>
                                    <button
                                        type="submit"
                                        className="w-24 p-2 bg-blue-400 text-white text-center rounded-md hover:bg-blue-700"
                                    >
                                        Register
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default LoginRegister;