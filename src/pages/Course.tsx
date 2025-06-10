import { SetStateAction, useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Pagination from "../components/ui/pagination/Pagination";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAccessToken, useDeviceQueries } from "../components/common/utils";
import Card from "../components/ui/card/Card";

interface Course {
  _id: string | null | undefined;
  course_name: string;
  course_instr?: string;
  course_rating?: number;
  course_totalHourse?: number;
  course_lectures?: number;
  course_level?: string;
  price: number;
  price_dis?: number;
  course_enrollmenters?: number;
  language?: string;
  thumbnail?: string;
}

export default function Course() {
  const [page, setPage] = useState(1);
  const [language, setLanguage] = useState<string | undefined>();
  const [sortOption, setSortOption] = useState<string | undefined>();
  const [level, setLevel] = useState<string | undefined>();
  const [priceFrom, setPriceFrom] = useState<number | undefined>();
  const [priceTo, setPriceTo] = useState<number | undefined>();
  const [searchText, setSearchText] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number | undefined>();
  const [courses, setCourses] = useState<Course[]>([]);

  const navigate = useNavigate();
  const deviceQueries = useDeviceQueries();
  const token = useAccessToken();
  const fetchCourses = async () => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/course/get-courses`,
      {
        language,
        sortOption,
        level,
        priceFrom,
        priceTo,
        page,
        searchText,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setCourses(response.data.courses);
    setTotalPages(Math.ceil(response.data.totalCourses / 18));
  };

  const handlePageChange = (pageNumber: SetStateAction<number>) => {
    if (
      typeof pageNumber === "number" &&
      pageNumber >= 1 &&
      pageNumber <= (totalPages ?? 0)
    ) {
      setPage(pageNumber);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const itemPerRow = deviceQueries.isMobile ? 1 : 3;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <>
      <PageMeta title="EzLearn - Khóa học" description="EzLearn - Khóa học" />
      <PageBreadcrumb pageTitle="Khóa học" />
      <div className="container mx-auto p-6">
        <div className="block lg:flex lg:space-x-4">
          <form className="w-full">
            <div className="relative">
              <input
                value={searchText}
                type="text"
                placeholder="Tìm theo tên khóa học"
                onChange={(e) => setSearchText(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />

              <div className="flex flex-wrap space-y-4 lg:space-y-0 lg:space-x-4 mt-4">
                <select
                  className="dark:bg-dark-900 h-11 w-full lg:w-auto rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  defaultValue=""
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="" disabled className="dark:text-gray-400">
                    Lọc theo ngôn ngữ
                  </option>
                  <option value="English" className="dark:text-white">
                    Tiếng Anh
                  </option>
                  <option value="Spanish" className="dark:text-white">
                    Tiếng Tây Ban Nha
                  </option>
                  <option value="German" className="dark:text-white">
                    Tiếng Đức
                  </option>
                  <option value="Japanese" className="dark:text-white">
                    Tiếng Nhật
                  </option>
                  <option value="Korean" className="dark:text-white">
                    Tiếng Hàn
                  </option>
                  <option value="French" className="dark:text-white">
                    Tiếng Pháp
                  </option>
                  <option value="Russian" className="dark:text-white">
                    Tiếng Nga
                  </option>
                  <option value="Italian" className="dark:text-white">
                    Tiếng Ý
                  </option>
                  <option value="Arabic" className="dark:text-white">
                    Tiếng Ả Rập
                  </option>
                  <option value="Poland" className="dark:text-white">
                    Tiếng Ba Lan
                  </option>
                </select>

                <div className="flex flex-wrap space-y-4 lg:space-y-0 lg:space-x-4">
                  <input
                    type="number"
                    placeholder="Giá từ"
                    className="dark:bg-dark-900 h-11 w-full lg:w-auto rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={priceFrom || ""}
                    onChange={(e) =>
                      setPriceFrom(Number(e.target.value) || undefined)
                    }
                  />
                  {/*  */}
                  <input
                    type="number"
                    placeholder="Giá đến"
                    className="dark:bg-dark-900 h-11 w-full lg:w-auto rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={priceTo || ""}
                    onChange={(e) =>
                      setPriceTo(Number(e.target.value) || undefined)
                    }
                  />
                </div>
                <select
                  className="dark:bg-dark-900 h-11 w-full lg:w-auto rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  defaultValue=""
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="" disabled className="dark:text-gray-400">
                    Lọc theo cấp độ
                  </option>
                  <option value="Beginner" className="dark:text-white">
                    Cơ bản
                  </option>
                  <option value="Intermediate" className="dark:text-white">
                    Nâng cao
                  </option>
                  <option value="Expert" className="dark:text-white">
                    Thành thạo
                  </option>
                </select>

                <select
                  className="dark:bg-dark-900 h-11 w-full lg:w-auto rounded-lg border border-gray-200 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="" disabled className="dark:text-gray-400">
                    Sắp xếp theo
                  </option>
                  <option value="0" className="dark:text-white">
                    Mới nhất
                  </option>
                  <option value="1" className="dark:text-white">
                    Điểm đánh giá trung bình
                  </option>
                  <option value="2" className="dark:text-white">
                    Số lượng người học
                  </option>
                </select>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded mt-2 lg:mt-2 lg:ml-2 flex items-center"
              onClick={handleSearch}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>
      {Array.from({ length: Math.ceil(courses.length / itemPerRow) }).map(
        (_, i) => {
          const courseChunk = courses.slice(
            i * itemPerRow,
            i * itemPerRow + itemPerRow
          );
          return (
            <div className="container mx-auto p-6" key={i}>
              <div className="flex space-x-6">
                {courseChunk.map((course) => (
                  <Card
                    key={course._id} // Use course._id as the key for each card
                    image={
                      course?.thumbnail || "https://via.placeholder.com/150"
                    }
                    title={course?.course_name || "Card title"}
                    description={
                      course?.course_instr ||
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Animii architecto aspernatur cum et ipsum"
                    }
                    rating={course?.course_rating || 0}
                    discountPrice={`${formatPrice(course?.price_dis || 0)} đ`}
                    price={`${formatPrice(course?.price || 0)} đ`}
                    onClick={() => navigate(`/your-course/${String(course._id)}`)}
                  />
                ))}
              </div>
            </div>
          );
        }
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages ?? 0}
        onPageChange={handlePageChange}
      />
    </>
  );
}
