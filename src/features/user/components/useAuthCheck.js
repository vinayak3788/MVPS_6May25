import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../config/firebaseConfig";
import toast from "react-hot-toast";

export function useAuthCheck() {
  const navigate = useNavigate();

  const validateMobile = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("No user logged in. Please login first.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get(`/api/get-profile?email=${user.email}`);
      const mobile = res.data?.mobileNumber;
      const mobileVerified = res.data?.mobileVerified;
      const role = res.data?.role || "user";

      if (!mobile || mobileVerified !== 1) {
        if (role !== "admin") {
          toast.error("Mobile number not verified.");
          setTimeout(() => {
            navigate("/verify-mobile");
          }, 1000);
        }
      }
    } catch (err) {
      console.error("❌ Error checking mobile verification", err);
      toast.error("Mobile verification failed. Login again.");
      navigate("/login");
    }
  };

  return { validateMobile };
}
