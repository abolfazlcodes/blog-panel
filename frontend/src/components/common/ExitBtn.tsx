import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import { Button } from "./Button";

const ExitBtn = () => {
  const navigate = useNavigate();

  const handleLogOutUser = () => {
    Cookies.remove("auth_token");
    navigate("/login");
  };

  return (
    <Button
      onClick={handleLogOutUser}
      variant="contained"
      colorType="error"
      className="rounded-full w-full flex items-center justify-center gap-x-4 p-2 cursor-pointer font-semibold"
    >
      Log out
    </Button>
  );
};

export default ExitBtn;
