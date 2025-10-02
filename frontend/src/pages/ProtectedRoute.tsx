import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router";

interface IProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const token = Cookies.get("auth_token");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [navigate, token]);

  if (token) return children;
};

export default ProtectedRoute;
