import PageMeta from "../../components/common/PageMeta";
import { FaUser, FaMoneyBillAlt, FaChartArea } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { constants } from "../../components/common/constant";
import { motion } from "framer-motion"; // Added for animations
import { useModal } from "../../hooks/useModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import axios from "axios";
import SelectUsingReactSelect from "../../components/form/form-elements/ReactSelect";
import Alert from "../../components/ui/alert/Alert";
import Badge from "../../components/ui/badge/Badge";
import { useAccessToken } from "../../components/common/utils";

// Interfaces remain unchanged
export interface ISchedule {
  date?: string;
  timeFrom: string;
  timeTo: string;
}

export interface IClass {
  _id?: string;
  className: string;
  teacherId: string;
  teacherName: string;
  maxStudent?: number;
  currentStudent: number | null | undefined;
  language: string;
  price: number;
  status: "open" | "closed";
  schedule: ISchedule[];
  classUrl: string;
  classType: "singleClass" | "classByWeeks";
  thumbnail?: string;
  stringForSearching?: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalRevenue?: number;
  totalStudent?: number;
  revenuePerStudent?: number;
  priceType: "byDay" | "byCourse";
}

export interface IStudent {
  studentName: string;
  email: string;
  phoneNumber: string;
  paymentStatus: string;
}

export interface ITeacher {
  _id: string;
  fullName: string;
}

export default function ClassDetail() {
  const { classId } = useParams();
  const [classData, setClassData] = useState<IClass | null>(null);
  const [draftClassData, setDraftClassData] = useState<IClass | null>(null);
  const [students, setStudents] = useState<IStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  const [teacherList, setTeacherList] = useState<ITeacher[]>([]);

  const token = useAccessToken();

  const isDateInPast = (dateString: string | undefined) => {
    if (!dateString) return false;
    const [day, month, year] = dateString.split("/");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/admin/fetch-class/${classId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch class data");
        }
        const data = await response.json();
        setClassData(data.classInfo);
        console.log(data.classInfo)
        setDraftClassData(data.classInfo);
        setStudents(data.studentInfo);
        setThumbnailPreview(data.classInfo.thumbnail || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  useEffect(() => {
    const fetchTeacherList = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/fetch-teacher-list`,
          { teachingLanguage: classData?.language },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTeacherList(response.data || []);
      } catch (error) {
        console.error("Failed to fetch teacher list:", error);
      }
    };

    fetchTeacherList();
  }, [classData?.language]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const handleSaveChanges = async () => {
    const formData = new FormData();
    formData.append("className", draftClassData?.className || "");
    formData.append("teacherId", draftClassData?.teacherId || "");
    formData.append("price", draftClassData?.price?.toString() || "");
    formData.append("schedule", JSON.stringify(draftClassData?.schedule || []));
    formData.append("thumbnail", thumbnailFile || "");
    formData.append("classUrl", draftClassData?.classUrl || "");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/update-class/${classId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setClassData(response.data);
        setDraftClassData(response.data);
        setSuccess("Lớp học đã được cập nhật thành công");
        closeModal();
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError("Cập nhật lớp học thất bại");
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Cập nhật lớp học thất bại"
      );
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 p-6">
      {success && (
        <div className="fixed top-5 left-0 right-0 z-1000 mt-12">
          <Alert
            variant="success"
            title="Thành công"
            message="Lớp học đã được cập nhật thành công"
          />
        </div>
      )}
      {error && (
        <div className="fixed top-5 left-0 right-0 z-1000 mt-12">
          <Alert
            variant="error"
            title="Lỗi"
            message="Cập nhật lớp học thất bại"
          />
        </div>
      )}
      <PageMeta
        title="EzLearn Admin- Quản lý lớp học"
        description="EzLearn Admin- Quản lý lớp học"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-blue-600">Chi tiết lớp học</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Quản lý thông tin chi tiết về lớp học
          </p>
        </div>
        <Button onClick={openModal}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Chỉnh sửa lớp học
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <div className="card bg-base-100 dark:bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 hover:border-primary p-3 rounded-lg">
            <div className="card-body">
              <h2 className="text-blue-600 card-title text-primary justify-center bg-base-200 py-2 rounded-lg flex items-center">
                <FaUser className="mr-2" /> Thông tin cơ bản
              </h2>
              <div className="space-y-4 mt-4">
                {[
                  { label: "Tên lớp", value: classData?.className },
                  { label: "Giảng viên", value: classData?.teacherName },
                  {
                    label: "Ngôn ngữ",
                    value: classData?.language
                      ? constants.languages[
                          classData.language as keyof typeof constants.languages
                        ]
                      : "",
                  },
                  {
                    label: "Thời gian",
                    value:
                      classData?.schedule?.length === 1
                        ? classData?.schedule[0]?.date
                        : `${classData?.schedule?.[0]?.date} - ${
                            classData?.schedule?.[classData.schedule.length - 1]
                              ?.date
                          }`,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-lg transition-colors"
                  >
                    <span className="font-semibold min-w-[120px] text-gray-700 dark:text-gray-300">
                      {item.label}:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.value}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <span className="font-semibold min-w-[120px] text-gray-700 dark:text-gray-300">
                    Trạng thái:
                  </span>
                  <span
                    className={`badge ${
                      classData?.status === "closed"
                        ? "badge-error"
                        : "badge-success"
                    } animate-bounce dark:text-gray-300`}
                  >
                    {classData?.status === "closed"
                      ? "Đã kết thúc"
                      : "Đang diễn ra"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <div className="card bg-base-100 dark:bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 hover:border-primary p-3 rounded-lg">
            <div className="card-body">
              <h2 className="text-blue-600 card-title text-primary justify-center bg-base-200 py-2 rounded-lg flex items-center">
                <FaMoneyBillAlt className="mr-2" /> Báo cáo doanh thu
              </h2>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-lg transition-colors">
                  <span className="font-semibold min-w-[120px] text-gray-700 dark:text-gray-300">
                    Tổng doanh thu:
                  </span>
                  <span className="text-success font-bold dark:text-gray-300">
                    {classData?.totalRevenue?.toLocaleString()} đ
                  </span>
                </div>
                <div className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-lg transition-colors">
                  <span className="font-semibold min-w-[120px] text-gray-700 dark:text-gray-300">
                    Học phí/học viên:
                  </span>
                  <span className="text-success font-bold dark:text-gray-300">
                    {classData?.revenuePerStudent?.toLocaleString()} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <div className="card bg-base-100 dark:bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 hover:border-primary p-3 rounded-lg ">
            <div className="card-body">
              <h2 className="text-blue-600 card-title text-primary justify-center bg-base-200 py-2 rounded-lg flex items-center">
                <FaChartArea className="mr-2" /> Thống kê học viên
              </h2>
              <div className="mt-4">
                <div className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-lg transition-colors">
                  <span className="font-semibold min-w-[120px] text-gray-700 dark:text-gray-300">
                    Tổng số học viên:
                  </span>
                  <span className="text-primary font-bold text-xl dark:text-gray-300">
                    {classData?.totalStudent}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card bg-base-100 dark:bg-base-200 shadow-xl"
      >
        <div className="card-body">
          <h1 className="text-blue-600 card-title bg-base-200 py-3 px-4 rounded-lg flex items-center font-bold">
            Danh sách học viên
          </h1>
          <div className="overflow-x-auto rounded-lg border border-base-300">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200 text-gray-700 dark:text-gray-300">
                  {[
                    "Họ tên",
                    "Email",
                    "Số điện thoại",
                    "Trạng thái thanh toán",
                  ].map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-sm font-semibold text-left"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-base-200 dark:hover:bg-base-300 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium dark:text-gray-300">
                      {student.studentName}
                    </td>
                    <td className="px-4 py-3 dark:text-gray-300">
                      {student.email}
                    </td>
                    <td className="px-4 py-3 dark:text-gray-300">
                      {student.phoneNumber}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        color={
                          student.paymentStatus === "Success"
                            ? "success"
                            : "error"
                        }
                      >
                        {student.paymentStatus === "Success"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] max-h-[90vh] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-6">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Chỉnh sửa lớp học
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Note: Không thể chỉnh sửa một số thông tin khi đã có học viên đăng
              ký lớp
            </p>
          </div>
          <form className="flex flex-col h-full">
            <div className="custom-scrollbar flex-1 overflow-y-auto px-2 pb-3">
              <div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Tên lớp học</Label>
                    <Input
                      value={draftClassData?.className || ""}
                      onChange={(e) => {
                        if (draftClassData) {
                          setDraftClassData({
                            ...draftClassData,
                            className: e.target.value,
                          });
                        }
                      }}
                      type="text"
                      className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      disabled={(classData?.currentStudent ?? 0) > 0}
                    />
                  </div>

                  <div>
                    <Label>Chỉ định giảng viên cho lớp</Label>
                    <SelectUsingReactSelect
                      options={
                        teacherList?.map((teacher) => ({
                          value: teacher._id,
                          label: `${teacher.fullName} - ID: ${teacher._id}`,
                        })) || []
                      }
                      placeholder={
                        draftClassData?.teacherName || "Tìm kiếm giảng viên"
                      }
                      onChange={(option) => {
                        const selectedTeacher = teacherList?.find(
                          (teacher) =>
                            teacher._id === option ||
                            teacher.fullName === option
                        );
                        if (selectedTeacher && draftClassData) {
                          setDraftClassData({
                            ...draftClassData,
                            teacherId: selectedTeacher._id,
                            teacherName: selectedTeacher.fullName,
                          });
                        }
                      }}
                      className="dark:bg-dark-900"
                      isSearchable={true}
                    />
                  </div>

                  <div>
                    <Label>
                      Học phí theo{" "}
                      {classData?.priceType === "byDay" ? "buổi" : "khóa"}
                    </Label>
                    <Input
                      value={draftClassData?.price || ""}
                      type="number"
                      className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      onChange={(e) => {
                        if (draftClassData) {
                          setDraftClassData({
                            ...draftClassData,
                            price: parseFloat(e.target.value),
                          });
                        }
                      }}
                    />
                  </div>

                  <div>
                    <Label>URL lớp học</Label>
                    <Input
                      value={draftClassData?.classUrl || ""}
                      type="text"
                      className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      onChange={(e) => {
                        if (draftClassData) {
                          setDraftClassData({
                            ...draftClassData,
                            classUrl: e.target.value,
                          });
                        }
                      }}
                    />
                  </div>

                  <div>
                    <Label>Ảnh thumbnail</Label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400 w-full px-3 py-2 border rounded-lg"
                      />
                      {thumbnailPreview && (
                        <div className="mt-2">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <Label className="text-lg font-semibold">Lịch học</Label>
                    <div className="space-y-4">
                      {classData?.classType === "singleClass" ? (
                        <div className="flex gap-4 items-end">
                          <div className="flex-1">
                            <Label className="text-sm">Ngày học</Label>
                            <Input
                              value={draftClassData?.schedule[0]?.date || ""}
                              type="text"
                              className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              onChange={(e) => {
                                if (draftClassData) {
                                  const newSchedule = [
                                    ...draftClassData.schedule,
                                  ];
                                  newSchedule[0] = {
                                    ...newSchedule[0],
                                    date: e.target.value,
                                  };
                                  setDraftClassData({
                                    ...draftClassData,
                                    schedule: newSchedule,
                                  });
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-sm">Thời gian bắt đầu</Label>
                            <Input
                              value={
                                draftClassData?.schedule[0]?.timeFrom || ""
                              }
                              type="time"
                              className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              onChange={(e) => {
                                if (draftClassData) {
                                  const newSchedule = [
                                    ...draftClassData.schedule,
                                  ];
                                  newSchedule[0] = {
                                    ...newSchedule[0],
                                    timeFrom: e.target.value,
                                  };
                                  setDraftClassData({
                                    ...draftClassData,
                                    schedule: newSchedule,
                                  });
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-sm">
                              Thời gian kết thúc
                            </Label>
                            <Input
                              value={draftClassData?.schedule[0]?.timeTo || ""}
                              type="time"
                              className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              onChange={(e) => {
                                if (draftClassData) {
                                  const newSchedule = [
                                    ...draftClassData.schedule,
                                  ];
                                  newSchedule[0] = {
                                    ...newSchedule[0],
                                    timeTo: e.target.value,
                                  };
                                  setDraftClassData({
                                    ...draftClassData,
                                    schedule: newSchedule,
                                  });
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {draftClassData?.schedule.map(
                            (schedule: ISchedule, index: number) => (
                              <div key={index} className="flex gap-4 items-end">
                                <div className="flex-1">
                                  <Label className="text-sm">Ngày học</Label>
                                  <Input
                                    value={schedule.date || ""}
                                    type="text"
                                    className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    onChange={(e) => {
                                      if (draftClassData) {
                                        const newSchedule = [
                                          ...draftClassData.schedule,
                                        ];
                                        newSchedule[index] = {
                                          ...newSchedule[index],
                                          date: e.target.value,
                                        };
                                        setDraftClassData({
                                          ...draftClassData,
                                          schedule: newSchedule,
                                        });
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label className="text-sm">
                                    Thời gian bắt đầu
                                  </Label>
                                  <Input
                                    value={schedule.timeFrom}
                                    type="time"
                                    className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    onChange={(e) => {
                                      if (draftClassData) {
                                        const newSchedule = [
                                          ...draftClassData.schedule,
                                        ];
                                        newSchedule[index] = {
                                          ...newSchedule[index],
                                          timeFrom: e.target.value,
                                        };
                                        setDraftClassData({
                                          ...draftClassData,
                                          schedule: newSchedule,
                                        });
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label className="text-sm">
                                    Thời gian kết thúc
                                  </Label>
                                  <Input
                                    value={schedule.timeTo}
                                    type="time"
                                    className="bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    onChange={(e) => {
                                      if (draftClassData) {
                                        const newSchedule = [
                                          ...draftClassData.schedule,
                                        ];
                                        newSchedule[index] = {
                                          ...newSchedule[index],
                                          timeTo: e.target.value,
                                        };
                                        setDraftClassData({
                                          ...draftClassData,
                                          schedule: newSchedule,
                                        });
                                      }
                                    }}
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="btn-error"
                                  onClick={() => {
                                    setScheduleToDelete(index);
                                    setShowConfirmModal(true);
                                  }}
                                  disabled={
                                    isDateInPast(schedule.date)
                                  }
                                >
                                  Hoãn
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (draftClassData) {
                                const newSchedule = {
                                  date: "",
                                  timeFrom: "",
                                  timeTo: "",
                                };
                                setDraftClassData({
                                  ...draftClassData,
                                  schedule: [
                                    ...draftClassData.schedule,
                                    newSchedule,
                                  ],
                                });
                              }
                            }}
                          >
                            Tạo lớp học bù
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-4 lg:justify-end border-t pt-4">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Đóng{" "}
              </Button>
              <Button size="sm" onClick={handleSaveChanges}>
                Lưu thay đổi{" "}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        className="max-w-[400px]"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Xác nhận hoãn lớp học</h3>
          <p className="mb-6">Bạn có chắc chắn muốn hoãn lớp học này?</p>
          <div className="flex justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (scheduleToDelete !== null && draftClassData) {
                  const newSchedule = [...draftClassData.schedule];
                  newSchedule.splice(scheduleToDelete, 1);
                  setDraftClassData({
                    ...draftClassData,
                    schedule: newSchedule,
                  });
                }
                setShowConfirmModal(false);
                setScheduleToDelete(null);
              }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
