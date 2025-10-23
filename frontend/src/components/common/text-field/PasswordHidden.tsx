import { Eye, EyeOff } from "lucide-react";

interface IPasswordHiddenProps {
  isHidden: boolean;
  onToggle: () => void;
}

const PasswordHidden: React.FC<IPasswordHiddenProps> = ({
  isHidden,
  onToggle,
}) => {
  return isHidden ? (
    <Eye className="cursor-pointer" onClick={onToggle} />
  ) : (
    <EyeOff className="cursor-pointer" onClick={onToggle} />
  );
};

export default PasswordHidden;
