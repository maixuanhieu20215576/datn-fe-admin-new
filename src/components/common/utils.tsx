import { useMediaQuery } from "react-responsive";

const useDeviceQueries = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const isTablet = useMediaQuery({
    query: "(min-width: 768px) and (max-width: 1024px)",
  });
  const isDesktop = useMediaQuery({ query: "(min-width: 1025px)" });

  return { isMobile, isTablet, isDesktop };
};

const getUserIdFromLocalStorage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user._id;
};

const getUserRoleFromLocalStorage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.role;
};

const getUserNameFromLocalStorage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.fullName;
};

const formatNumber = (number: number) => {
  return number.toLocaleString("vi-VN");
};
export { useDeviceQueries, getUserIdFromLocalStorage, getUserRoleFromLocalStorage, formatNumber, getUserNameFromLocalStorage };
