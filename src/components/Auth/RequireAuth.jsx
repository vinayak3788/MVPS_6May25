import { useEffect, useState } from "react";
import { auth } from "../../config/firebaseConfig";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function RequireAuth({ children, role }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      console.log("🚀 Checking session start...");
      let retries = 0;
      while (retries < 25) {
        // ~5 seconds max
        const user = auth.currentUser;
        console.log(`🔎 Attempt ${retries} | user =`, user?.email);

        if (user) {
          try {
            console.log("🔵 User found. Forcing token refresh...");
            const token = await user.getIdToken(true);
            console.log("✅ Token refreshed.");

            console.log("🔵 Fetching user role...");
            const res = await axios.get(`/api/get-role?email=${user.email}`);
            const userRole = res.data.role;
            console.log(`✅ Role fetched: ${userRole}`);

            if (role && userRole !== role) {
              console.warn(
                `❗ Role mismatch. Required: ${role}, Got: ${userRole}`,
              );
              toast.error("Access denied. Redirecting...");
              if (userRole === "admin") {
                navigate("/admin", { replace: true });
              } else {
                navigate("/userdashboard", { replace: true });
              }
            } else {
              console.log("🎯 Role matched. Continuing...");
            }

            setPending(false);
            return;
          } catch (err) {
            console.error("⛔ Error fetching role or refreshing token:", err);
            toast.error("Session invalid. Please login again.");
            await auth.signOut();
            navigate("/login", { replace: true });
            setPending(false);
            return;
          }
        }

        retries++;
        await new Promise((resolve) => setTimeout(resolve, 200)); // wait 200ms
      }

      console.error("❌ User not found after retries. Session timeout.");
      toast.error("Session timeout. Please login again.");
      navigate("/login", { replace: true });
      setPending(false);
    };

    checkSession();
  }, [navigate, role]);

  if (pending) {
    return <div className="text-center mt-10">Checking login session...</div>;
  }

  return children;
}
