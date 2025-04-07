import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import axios from "axios";
import { formatNumber } from "../common/utils";
export default function EcommerceMetrics() {
  const [orderStatistics, setOrderStatistics] = useState({
    totalStudents: 0,
    comparedTotalStudents: 0,
    totalRevenue: 0,
    comparedTotalRevenue: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/get-order-statistics`);
      setOrderStatistics(response.data);
    };
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Học viên mới
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(orderStatistics.totalStudents)}
            </h4>
          </div>
          <Badge color={orderStatistics.comparedTotalStudents > 0 ? "success" : "error"}>
            {orderStatistics.comparedTotalStudents > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {formatNumber((orderStatistics.comparedTotalStudents))}%          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Doanh thu
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(orderStatistics.totalRevenue)}
            </h4>
          </div>

          <Badge color={orderStatistics.comparedTotalRevenue > 0 ? "success" : "error"}>
            {orderStatistics.comparedTotalRevenue > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}  
            {formatNumber(orderStatistics.comparedTotalRevenue)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
