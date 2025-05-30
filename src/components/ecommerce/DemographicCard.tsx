import { useEffect, useState } from "react";
import CountryMap from "./CountryMap";
import axios from "axios";
import { useAccessToken } from "../common/utils";

interface LanguageFrequent {
  language: string;
  count: number;
  percentage: number;
}

export default function DemographicCard() {
  const [languageFrequent, setLanguageFrequent] = useState<LanguageFrequent[]>([]);
  const token = useAccessToken();

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/get-language-frequent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLanguageFrequent(response.data);
    };
    fetchData();
  }, []);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Bản đồ ngôn ngữ          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Dựa trên ngôn ngữ học viên đăng ký học
          </p>
        </div>

      </div>
      <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl dark:border-gray-800 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap />
        </div>
      </div>

      <div className="space-y-5">
        {languageFrequent
          .filter(item => item.count > 0)
          .map((item: LanguageFrequent) => (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="items-center w-full rounded-full max-w-8">
                <img src={`./images/country/${item.language}.svg`} alt={item.language} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                  {item.language}
                </p>
                <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                  {item.count} học viên
                </span>
              </div>
            </div>

            <div className="flex w-full max-w-[140px] items-center gap-3">
              <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                <div 
                  className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {item.percentage}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
